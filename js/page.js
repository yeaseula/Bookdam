document.addEventListener('DOMContentLoaded', function () {

    const $ = (node) => document.querySelector(node);

    const animations = {
        done: lottie.loadAnimation({
            container: document.getElementById('lottie-animation'),
            renderer: 'svg',
            loop: false,
            autoplay: (currentpage === 'done'),
            path: 'nav-animation/Celebrations.json',
        }),
    };

});

