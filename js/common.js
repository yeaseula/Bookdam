
document.addEventListener('DOMContentLoaded', function () {
    const $ = (node) => document.querySelector(node);

    fetch('./navigation.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('bottom_navigator').innerHTML = data;
            const animations = {
                home: lottie.loadAnimation({
                    container: document.getElementById('home-icon'),
                    renderer: 'svg',
                    loop: false,
                    autoplay: (currentpage === 'home'),
                    path: 'nav-animation/home.json'
                }),
                search: lottie.loadAnimation({
                    container: document.getElementById('review-icon'),
                    renderer: 'svg',
                    loop: false,
                    autoplay: (currentpage === 'review'),
                    path: 'nav-animation/review.json'
                }),
                review: lottie.loadAnimation({
                    container: document.getElementById('reading-icon'),
                    renderer: 'svg',
                    loop: false,
                    autoplay: (currentpage === 'reading'),
                    path: 'nav-animation/review2.json'
                }),
                mypage: lottie.loadAnimation({
                    container: document.getElementById('mypage-icon'),
                    renderer: 'svg',
                    loop: false,
                    autoplay: (currentpage === 'mypage'),
                    path: 'nav-animation/profile.json',
                }),
            };

            if(currentpage !== 'mypage') {
                animations.mypage.goToAndStop(80,true)
            }
        })
        .catch(error => {
        console.error('파일 로딩 오류:', error);
    });

    fetch('./footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer').innerHTML = data;
            //footer my information toggle
            const Copytogglebtn = $('#footer-toggle');

            Copytogglebtn.addEventListener('click',()=>{
                const Copytogglecont = $('.copyright-dropdown');
                const hasCont = Copytogglecont.classList.contains('is-active');
                if(!hasCont) {
                    Copytogglecont.classList.add('is-active');
                } else {
                    Copytogglecont.classList.remove('is-active');
                }
            })
        })
        .catch(error => {
            console.error('파일 로딩 오류:', error);
        })


})
