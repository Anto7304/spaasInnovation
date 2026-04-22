// intake.js - Intake Form Handler
const API_URL = "http://localhost:5000/api";

// Check authentication and redirect if not logged in
document.addEventListener("DOMContentLoaded", async function() {
    // Check if user is authenticated
    if (!isAuthenticated()) {
        window.location.href = "/pages/login.html";
        return;
    }

    // Check if intake is already completed
    try {
        const response = await fetch(`${API_URL}/intake/status`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        
        if (response.ok && data.success && data.completed) {
            // Intake already completed, redirect to dashboard
            const user = getCurrentUser();
            if (user.role === "admin") {
                window.location.href = "/pages/admin-dashboard.html";
            } else {
                window.location.href = "/pages/dashboard.html";
            }
            return;
        }
    } catch (error) {
        console.error("Error checking intake status:", error);
    }

    // Pre-fill email from user data
    const user = getCurrentUser();
    if (user && user.email) {
        const emailInput = document.getElementById("email");
        if (emailInput) {
            emailInput.value = user.email;
        }
    }

    // Setup form submission
    const intakeForm = document.getElementById("intake-form");
    if (intakeForm) {
        intakeForm.addEventListener("submit", handleIntakeSubmit);
    }
});

// Handle intake form submission
async function handleIntakeSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const age = document.getElementById("age")?.value;
    const yearOfStudy = document.getElementById("yearOfStudy")?.value;
    const program = document.getElementById("program")?.value.trim();
    
    // Clear previous errors
    document.querySelectorAll(".field-error").forEach(el => el.textContent = "");
    
    let isValid = true;
    
    // Validation
    if (!name) {
        document.getElementById("name-error").textContent = "Full name is required";
        isValid = false;
    } else if (name.length < 2) {
        document.getElementById("name-error").textContent = "Name must be at least 2 characters";
        isValid = false;
    }
    
    if (!email) {
        document.getElementById("email-error").textContent = "Email is required";
        isValid = false;
    } else if (!email.includes("@")) {
        document.getElementById("email-error").textContent = "Please enter a valid email";
        isValid = false;
    }
    
    if (!age) {
        document.getElementById("age-error").textContent = "Age is required";
        isValid = false;
    } else {
        const ageNum = parseInt(age);
        if (ageNum < 16 || ageNum > 100) {
            document.getElementById("age-error").textContent = "Age must be between 16 and 100";
            isValid = false;
        }
    }
    
    if (!yearOfStudy) {
        document.getElementById("yearOfStudy-error").textContent = "Year of study is required";
        isValid = false;
    }
    
    if (!program) {
        document.getElementById("program-error").textContent = "Program is required";
        isValid = false;
    } else if (program.length < 2) {
        document.getElementById("program-error").textContent = "Program must be at least 2 characters";
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Show loading state
    const btn = document.querySelector(".auth-btn");
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = "<i class=\"fas fa-spinner fa-spin\"></i> Submitting...";
    }
    
    try {
        const response = await fetch(`${API_URL}/intake`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                age: parseInt(age),
                yearOfStudy,
                program
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Success - redirect to consent form
            window.location.href = "/pages/consent.html";
        } else {
            // Success - redirect to consent form
            window.location.href = "/pages/consent.html";
        } else {
            // Show error
            const errorMsg = data.message || "Failed to submit intake form";
            alert(errorMsg);
            
            // Reset button
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = "<i class=\"fas fa-paper-plane\"></i> Submit Intake Form";
            }
        }
    } catch (error) {
        console.error("Intake submission error:", error);
        alert("Network error. Please try again.");
        
        // Reset button
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = "<i class=\"fas fa-paper-plane\"></i> Submit Intake Form";
        }
    }
}
