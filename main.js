const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('in');
  });
}, { threshold: .14 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
