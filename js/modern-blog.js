/**
 * Modern Blog JavaScript
 * Features: Dark mode, Search, Reading Progress, TOC, Code Copy
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSearch();
    initReadingProgress();
    initScrollToTop();
    initCodeCopy();
    initToc();
});

/* --- Dark Mode --- */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const currentTheme = savedTheme || (prefersDark.matches ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateToggleIcon(currentTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateToggleIcon(newTheme);
        });
    }
}

function updateToggleIcon(theme) {
    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fa fa-sun-o' : 'fa fa-moon-o';
    }
}

/* --- Search Functionality --- */
function initSearch() {
    const searchTrigger = document.querySelector('.search-trigger');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const closeSearch = document.querySelector('.close-search');
    
    if (!searchTrigger || !searchOverlay) return;
    
    // Open Search
    searchTrigger.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        searchInput.focus();
        document.body.style.overflow = 'hidden';
    });
    
    // Close Search
    const close = () => {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
        searchInput.value = '';
        searchResults.innerHTML = '';
    };
    
    closeSearch.addEventListener('click', close);
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) close();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            close();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            searchOverlay.classList.add('active');
            searchInput.focus();
        }
    });
    
    // Search Logic (Simple Fetch)
    let posts = [];
    fetch('/search.json')
        .then(response => response.json())
        .then(data => {
            posts = data;
        })
        .catch(err => console.error('Error loading search data:', err));
        
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }
        
        const filtered = posts.filter(post => 
            post.title.toLowerCase().includes(query) || 
            post.tags.some(tag => tag.toLowerCase().includes(query))
        ).slice(0, 5);
        
        displayResults(filtered, searchResults);
    });
}

function displayResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<div class="no-results">No results found</div>';
        return;
    }
    
    const html = results.map(post => `
        <a href="${post.url}" class="search-result-item">
            <h4>${post.title}</h4>
            <p>${post.date}</p>
        </a>
    `).join('');
    
    container.innerHTML = html;
}

/* --- Reading Progress --- */
function initReadingProgress() {
    const bar = document.querySelector('.reading-progress-bar');
    if (!bar) return;
    
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        bar.style.width = scrolled + "%";
    });
}

/* --- Scroll To Top --- */
function initScrollToTop() {
    const btn = document.querySelector('.scroll-to-top');
    if (!btn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
    
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* --- Code Copy Button --- */
function initCodeCopy() {
    document.querySelectorAll('pre').forEach(block => {
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.innerText = 'Copy';
        
        button.addEventListener('click', () => {
            const code = block.querySelector('code').innerText;
            navigator.clipboard.writeText(code).then(() => {
                button.innerText = 'Copied!';
                setTimeout(() => button.innerText = 'Copy', 2000);
            });
        });
        
        block.appendChild(button);
    });
}

/* --- Table of Contents --- */
function initToc() {
    const tocLinks = document.querySelectorAll('.toc-link');
    if (tocLinks.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                tocLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: '-100px 0px -66%' });
    
    document.querySelectorAll('h2, h3').forEach(heading => {
        observer.observe(heading);
    });
}
