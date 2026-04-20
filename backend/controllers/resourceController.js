const Resource = require('../models/Resource');

exports.createResource = async (req, res) => {
  try {
    const { title, description, category, fileLink, thumbnail, duration, author, tags } = req.body;

    const resource = new Resource({
      title,
      description,
      category,
      fileLink,
      thumbnail,
      duration,
      author: author || 'Smash&Heal Team',
      tags: tags || [],
      isPublished: true,
    });

    await resource.save();

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      resource,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating resource',
      error: error.message,
    });
  }
};

exports.getAllResources = async (req, res) => {
  try {
    const { category, search } = req.query;

    let filter = { isPublished: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const resources = await Resource.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching resources',
      error: error.message,
    });
  }
};

exports.getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);

    if (!resource || !resource.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Increment view count
    resource.views += 1;
    await resource.save();

    res.status(200).json({
      success: true,
      resource,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching resource',
      error: error.message,
    });
  }
};

exports.updateResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { title, description, category, fileLink, thumbnail, duration, author, tags, isPublished } = req.body;

    let resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Update fields
    if (title) resource.title = title;
    if (description) resource.description = description;
    if (category) resource.category = category;
    if (fileLink) resource.fileLink = fileLink;
    if (thumbnail) resource.thumbnail = thumbnail;
    if (duration) resource.duration = duration;
    if (author) resource.author = author;
    if (tags) resource.tags = tags;
    if (isPublished !== undefined) resource.isPublished = isPublished;

    await resource.save();

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      resource,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating resource',
      error: error.message,
    });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    await Resource.findByIdAndDelete(resourceId);

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting resource',
      error: error.message,
    });
  }
};

exports.getResourcesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const resources = await Resource.find({
      category,
      isPublished: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      category,
      resources,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching resources by category',
      error: error.message,
    });
  }
};
