if (window.WCResearch) {
  WCResearch.renderIndex(document.getElementById('researchIndex'));
  WCResearch.renderStats(document.getElementById('researchStats'));
  WCResearch.renderFeatured(document.getElementById('researchFeatured'));
  document.getElementById('researchFaculty').innerHTML = `Faculty: ${WCResearch.facultyLinks()}`;
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('in');
  });
}, { threshold: .14 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
