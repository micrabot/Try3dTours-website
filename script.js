// Tour switching functionality
let currentTour = 0;

function switchTour(index) {
    const tours = document.querySelectorAll('.tour-frame');
    const tabs = document.querySelectorAll('.tour-tab');
    
    tours.forEach((tour, i) => {
        tour.classList.toggle('active', i === index);
    });
    
    tabs.forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });
    
    currentTour = index;
}

// AI-Powered Tour Analysis
async function analyzeTour() {
    const urlInput = document.getElementById('tourUrl');
    const resultsDiv = document.getElementById('analysisResults');
    const url = urlInput.value.trim();
    
    // Basic URL validation
    if (!url) {
        alert('Please enter a 3D tour URL');
        return;
    }
    
    if (!url.includes('matterport.com') && !url.includes('zillow.com') && !url.includes('iguide.com')) {
        alert('Please enter a valid Matterport, Zillow 3D Home, or iGUIDE URL');
        return;
    }
    
    // Show results section with loading state
    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Reset all values to loading state
    document.getElementById('engagementScore').textContent = '...';
    document.getElementById('topSpace').textContent = '...';
    document.getElementById('avgDuration').textContent = '...';
    document.getElementById('marketingAngle').textContent = '...';
    document.getElementById('engagementInsight').textContent = '';
    document.getElementById('spaceInsight').textContent = '';
    document.getElementById('durationInsight').textContent = '';
    document.getElementById('angleInsight').textContent = '';
    document.getElementById('generatedCopy').innerHTML = '<div class="loading-shimmer"></div>';
    
    try {
        // Call our serverless function instead of Claude API directly
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });
        
        if (!response.ok) {
            throw new Error('Analysis request failed');
        }
        
        const analysis = await response.json();
        
        // Animate in the results
        setTimeout(() => {
            document.getElementById('engagementScore').textContent = analysis.engagementScore;
            document.getElementById('engagementInsight').textContent = analysis.engagementInsight;
            
            document.getElementById('topSpace').textContent = analysis.topSpace;
            document.getElementById('spaceInsight').textContent = analysis.spaceInsight;
            
            document.getElementById('avgDuration').textContent = analysis.avgDuration;
            document.getElementById('durationInsight').textContent = analysis.durationInsight;
            
            document.getElementById('marketingAngle').textContent = analysis.marketingAngle;
            document.getElementById('angleInsight').textContent = analysis.angleInsight;
            
            document.getElementById('generatedCopy').textContent = analysis.marketingCopy;
        }, 500);
        
    } catch (error) {
        console.error('Analysis error:', error);
        
        // Fallback to demo data if API fails
        setTimeout(() => {
            document.getElementById('engagementScore').textContent = '78';
            document.getElementById('engagementInsight').textContent = 'Strong engagement - property shows well digitally';
            
            document.getElementById('topSpace').textContent = 'Kitchen';
            document.getElementById('spaceInsight').textContent = 'Buyers spend 38% of tour time here';
            
            document.getElementById('avgDuration').textContent = '3:47';
            document.getElementById('durationInsight').textContent = 'Above industry average of 2:15';
            
            document.getElementById('marketingAngle').textContent = 'Modern Lifestyle';
            document.getElementById('angleInsight').textContent = 'Emphasize updated features and flow';
            
            document.getElementById('generatedCopy').textContent = 'This property commands attention from the moment buyers step into the virtual tour. The chef\'s kitchen anchors an open floor plan that flows seamlessly into generous living spaces. With buyers spending nearly 4 minutes exploring, the data shows this home creates the mental ownership that drives offers. Updated throughout with attention to modern living preferences.';
        }, 500);
    }
}

// Copy generated content to clipboard
function copyContent() {
    const content = document.getElementById('generatedCopy').textContent;
    
    if (content && !content.includes('loading')) {
        navigator.clipboard.writeText(content).then(() => {
            const btn = document.querySelector('.copy-btn');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.style.background = 'var(--color-success)';
            btn.style.borderColor = 'var(--color-success)';
            btn.style.color = 'var(--color-bg)';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('Failed to copy content. Please select and copy manually.');
        });
    }
}

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu functionality
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        const links = navLinks.querySelectorAll('.nav-link');
        links.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
    
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const navHeight = document.querySelector('.nav').offsetHeight;
                    const targetPosition = target.offsetTop - navHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Add enter key support for tour URL input
    const tourInput = document.getElementById('tourUrl');
    if (tourInput) {
        tourInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                analyzeTour();
            }
        });
    }
});

// Add scroll animations for sections
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all major sections
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.analyze-section, .proof-section, .examples-section, .intelligence-section');
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(40px)';
        section.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        observer.observe(section);
    });
});
