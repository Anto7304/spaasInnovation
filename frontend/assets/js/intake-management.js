// intake-management.js - Admin Intake Management
const API_URL = "http://localhost:5000/api";

let currentPage = 1;
let currentFilters = {
    status: 'all',
    priority: 'all',
    search: ''
};
let totalPages = 1;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and admin role
    if (!isAuthenticated() || !isAdmin()) {
        window.location.href = '/pages/login.html';
        return;
    }

    // Set admin name
    const user = getCurrentUser();
    if (user) {
        document.getElementById('admin-name').textContent = user.fullName || user.name;
    }

    // Initialize page
    loadIntakeStats();
    loadIntakeForms();

    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Filter changes
    document.getElementById('status-filter').addEventListener('change', function() {
        currentFilters.status = this.value;
        currentPage = 1;
        loadIntakeForms();
    });

    document.getElementById('priority-filter').addEventListener('change', function() {
        currentFilters.priority = this.value;
        currentPage = 1;
        loadIntakeForms();
    });

    document.getElementById('search-input').addEventListener('input', function() {
        currentFilters.search = this.value.trim();
        currentPage = 1;
        loadIntakeForms();
    });

    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', function() {
        loadIntakeStats();
        loadIntakeForms();
    });

    // Pagination
    document.getElementById('prev-page').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            loadIntakeForms();
        }
    });

    document.getElementById('next-page').addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            loadIntakeForms();
        }
    });
}

// Load intake statistics
async function loadIntakeStats() {
    try {
        const response = await fetch(API_URL + '/intake/admin/stats', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            const stats = data.stats;
            
            // Update stat cards
            document.getElementById('pending-count').textContent = 
                stats.statusBreakdown.find(function(s) { return s._id === 'pending'; })?.count || 0;
            document.getElementById('review-count').textContent = 
                stats.statusBreakdown.find(function(s) { return s._id === 'under_review'; })?.count || 0;
            document.getElementById('approved-count').textContent = 
                stats.statusBreakdown.find(function(s) { return s._id === 'approved'; })?.count || 0;
            document.getElementById('followup-count').textContent = 
                stats.statusBreakdown.find(function(s) { return s._id === 'needs_followup'; })?.count || 0;
        }
    } catch (error) {
        console.error('Error loading intake stats:', error);
    }
}

// Load intake forms
async function loadIntakeForms() {
    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: 10,
            status: currentFilters.status,
            priority: currentFilters.priority,
            search: currentFilters.search
        });

        const response = await fetch(API_URL + '/intake/admin/all?' + params, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            displayIntakeForms(data.data);
            updatePagination(data.pagination, data.summary);
        } else {
            showError('Failed to load intake forms');
        }
    } catch (error) {
        console.error('Error loading intake forms:', error);
        showError('Network error while loading intake forms');
    }
}

function displayIntakeForms(intakes) {
    const tbody = document.getElementById('intake-table-body');
    tbody.innerHTML = '';

    if (intakes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No intake forms found</td></tr>';
        return;
    }

    intakes.forEach(function(intake) {
        const row = createIntakeRow(intake);
        tbody.appendChild(row);
    });
}

function createIntakeRow(intake) {
    const row = document.createElement('tr');

    const statusClass = getStatusClass(intake.evaluationStatus);
    const priorityClass = getPriorityClass(intake.priorityLevel);

    row.innerHTML = '<td><div class="patient-info"><div class="patient-name">' + intake.name + '</div><div class="patient-email">' + intake.email + '</div></div></td><td>' + intake.age + '</td><td>' + intake.program + '</td><td>' + intake.yearOfStudy + '</td><td><span class="status-badge ' + statusClass + '">' + formatStatus(intake.evaluationStatus) + '</span></td><td><span class="priority-badge ' + priorityClass + '">' + formatPriority(intake.priorityLevel) + '</span></td><td>' + formatDate(intake.completedAt) + '</td><td><div class="action-buttons"><button class="btn-icon view-btn" onclick="viewIntake(\'' + intake._id + '\')" title="View Details"><i class="fas fa-eye"></i></button><button class="btn-icon evaluate-btn" onclick="evaluateIntake(\'' + intake._id + '\')" title="Evaluate"><i class="fas fa-clipboard-check"></i></button></div></td>';

    return row;
}

function updatePagination(pagination, summary) {
    totalPages = pagination.totalPages;
    currentPage = pagination.currentPage;

    // Update pagination info
    const startItem = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
    const endItem = Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems);
    document.getElementById('pagination-info').textContent = 'Showing ' + startItem + ' to ' + endItem + ' of ' + pagination.totalItems + ' entries';

    // Update pagination controls
    document.getElementById('prev-page').disabled = pagination.currentPage <= 1;
    document.getElementById('next-page').disabled = pagination.currentPage >= pagination.totalPages;

    // Update page numbers
    const pageNumbers = document.getElementById('page-numbers');
    pageNumbers.innerHTML = 'Page ' + pagination.currentPage + ' of ' + pagination.totalPages;
}

// View intake details
async function viewIntake(intakeId) {
    try {
        const response = await fetch(API_URL + '/intake/admin/all?search=&status=all&priority=all&page=1&limit=1000', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            const intake = data.data.find(function(i) { return i._id === intakeId; });
            if (intake) {
                showIntakeDetails(intake);
            }
        }
    } catch (error) {
        console.error('Error viewing intake:', error);
    }
}

// Evaluate intake
async function evaluateIntake(intakeId) {
    try {
        const response = await fetch(API_URL + '/intake/admin/all?search=&status=all&priority=all&page=1&limit=1000', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            const intake = data.data.find(function(i) { return i._id === intakeId; });
            if (intake) {
                openEvaluationModal(intake);
            }
        }
    } catch (error) {
        console.error('Error loading intake for evaluation:', error);
    }
}

function showIntakeDetails(intake) {
    let detailsHtml = '<div class="intake-details"><h3>Patient Information</h3><div class="details-grid">';
    detailsHtml += '<div class="detail-item"><label>Name:</label><span>' + intake.name + '</span></div>';
    detailsHtml += '<div class="detail-item"><label>Email:</label><span>' + intake.email + '</span></div>';
    detailsHtml += '<div class="detail-item"><label>Age:</label><span>' + intake.age + '</span></div>';
    detailsHtml += '<div class="detail-item"><label>Year of Study:</label><span>' + intake.yearOfStudy + '</span></div>';
    detailsHtml += '<div class="detail-item"><label>Program:</label><span>' + intake.program + '</span></div>';
    detailsHtml += '<div class="detail-item"><label>Submitted:</label><span>' + formatDate(intake.completedAt) + '</span></div>';
    detailsHtml += '<div class="detail-item"><label>Status:</label><span class="status-badge ' + getStatusClass(intake.evaluationStatus) + '">' + formatStatus(intake.evaluationStatus) + '</span></div>';
    detailsHtml += '<div class="detail-item"><label>Priority:</label><span class="priority-badge ' + getPriorityClass(intake.priorityLevel) + '">' + formatPriority(intake.priorityLevel) + '</span></div>';
    detailsHtml += '</div>';
    
    if (intake.evaluationNotes) {
        detailsHtml += '<h3>Evaluation Notes</h3><p>' + intake.evaluationNotes + '</p>';
    }
    
    if (intake.recommendations) {
        detailsHtml += '<h3>Recommendations</h3><p>' + intake.recommendations + '</p>';
    }
    
    if (intake.evaluatedBy) {
        detailsHtml += '<h3>Evaluated By</h3><p>' + intake.evaluatedBy.name + ' (' + intake.evaluatedBy.email + ') on ' + formatDate(intake.evaluatedAt) + '</p>';
    }
    
    detailsHtml += '</div>';

    // Create a simple modal
    const modal = document.createElement('div');
    modal.className = 'simple-modal';
    modal.innerHTML = '<div class="simple-modal-content"><div class="simple-modal-header"><h2>Intake Form Details</h2><button onclick="this.closest(\'.simple-modal\').remove()">×</button></div><div class="simple-modal-body">' + detailsHtml + '</div></div>';
    
    document.body.appendChild(modal);
}

function openEvaluationModal(intake) {
    document.getElementById('evaluation-status').value = intake.evaluationStatus;
    document.getElementById('priority-level').value = intake.priorityLevel;
    document.getElementById('evaluation-notes').value = intake.evaluationNotes || '';
    document.getElementById('recommendations').value = intake.recommendations || '';

    // Store intake ID for submission
    document.getElementById('evaluation-form').dataset.intakeId = intake._id;
    
    // Show intake details in modal
    const detailsHtml = '<div class="intake-summary"><h4>Patient: ' + intake.name + '</h4><p><strong>Email:</strong> ' + intake.email + '</p><p><strong>Age:</strong> ' + intake.age + ' | <strong>Program:</strong> ' + intake.program + '</p><p><strong>Year:</strong> ' + intake.yearOfStudy + '</p></div>';
    
    document.getElementById('intake-details').innerHTML = detailsHtml;
    document.getElementById('evaluation-modal').style.display = 'block';
}

function closeEvaluationModal() {
    document.getElementById('evaluation-modal').style.display = 'none';
}

async function submitEvaluation() {
    const form = document.getElementById('evaluation-form');
    const intakeId = form.dataset.intakeId;
    
    const evaluationData = {
        evaluationStatus: document.getElementById('evaluation-status').value,
        priorityLevel: document.getElementById('priority-level').value,
        evaluationNotes: document.getElementById('evaluation-notes').value.trim(),
        recommendations: document.getElementById('recommendations').value.trim()
    };

    try {
        const response = await fetch(API_URL + '/intake/admin/' + intakeId + '/evaluate', {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(evaluationData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            closeEvaluationModal();
            loadIntakeStats();
            loadIntakeForms();
            showSuccess('Intake form evaluated successfully');
        } else {
            showError(data.message || 'Failed to submit evaluation');
        }
    } catch (error) {
        console.error('Error submitting evaluation:', error);
        showError('Network error while submitting evaluation');
    }
}

// Utility functions
function getStatusClass(status) {
    const classes = {
        'pending': 'status-pending',
        'under_review': 'status-review',
        'approved': 'status-approved',
        'needs_followup': 'status-followup',
        'rejected': 'status-rejected'
    };
    return classes[status] || 'status-pending';
}

function getPriorityClass(priority) {
    const classes = {
        'low': 'priority-low',
        'medium': 'priority-medium',
        'high': 'priority-high',
        'urgent': 'priority-urgent'
    };
    return classes[priority] || 'priority-medium';
}

function formatStatus(status) {
    const labels = {
        'pending': 'Pending',
        'under_review': 'Under Review',
        'approved': 'Approved',
        'needs_followup': 'Needs Follow-up',
        'rejected': 'Rejected'
    };
    return labels[status] || status;
}

function formatPriority(priority) {
    const labels = {
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High',
        'urgent': 'Urgent'
    };
    return labels[priority] || priority;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
}

function showError(message) {
    alert('Error: ' + message);
}

function showSuccess(message) {
    alert('Success: ' + message);
}
