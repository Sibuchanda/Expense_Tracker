document.addEventListener('DOMContentLoaded', () => {
    const name = localStorage.getItem("expenseuserName");
    if (name) {
        window.location.href = "dashboard/dashboard.html";
        return;
    }
    const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateOnScrollElements.forEach(el => {
        observer.observe(el);
    });

    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const currentContent = header.nextElementSibling;
            const currentIcon = header.querySelector('.accordion-icon');
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== header && otherHeader.classList.contains('active')) {
                    otherHeader.classList.remove('active');
                    otherHeader.nextElementSibling.style.maxHeight = null;
                    otherHeader.nextElementSibling.style.paddingTop = '0';
                    otherHeader.nextElementSibling.style.paddingBottom = '0';
                    otherHeader.querySelector('.accordion-icon').classList.remove('active');
                }
            });
            header.classList.toggle('active');
            currentIcon.classList.toggle('active');

            if (currentContent.style.maxHeight) {
                currentContent.style.maxHeight = null;
                currentContent.style.paddingTop = '0';
                currentContent.style.paddingBottom = '0';
            } else {
                currentContent.style.maxHeight = currentContent.scrollHeight + 'px';
                currentContent.style.paddingTop = '20px';
                currentContent.style.paddingBottom = '20px';
            }
        });
    });
});


const getUserInfo = ()=>{
            let name = prompt("Please enter your name to continue:");
            if (name && name.trim() !== "") {
                localStorage.setItem("expenseuserName", name.trim());
                window.location.href = "dashboard/dashboard.html";
            } else {
                alert("Name is required to continue.");
            }
}
