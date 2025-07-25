document.addEventListener('DOMContentLoaded', function () {

    const $ = (node) => document.querySelector(node);

    //main slider
    const MyBookList = new Swiper('.my_book_list', {
        slidesPerView: 'auto',
        loop: true,
        centeredSlides : true,
    });


    //calendar for book stamp
    var calendarEl = document.getElementById('calendar');
    var initialLocaleCode = 'en';
    var calendar = new FullCalendar.Calendar(calendarEl, {
        headerToolbar: {
            left:'',
            right: 'prev,next',
            center: 'title',
        },
        locale:initialLocaleCode,

    });
    calendar.render();

    //data 연결 예정입니다
    //기록 날짜를 불러와 캘린더 객체의 date키 값과 일치하는지 확인한 후 스탬프를 찍습니다.
    let stampDates = ['2025-07-10', '2025-07-12', '2025-07-19'];
    function StampFunc () {
        let calendarbox = document.querySelectorAll('.fc-scrollgrid-sync-table td');
        let dayList = [...Array.from(calendarbox)];
        dayList.forEach((ele,idx)=>{
            let {date:dayValue} =dayList[idx].dataset
            stampDates.forEach((ele,idx2)=>{
                if (dayValue == stampDates[idx2]) {
                    dayList[idx].classList.add('simple')
                }
            })
        })
    }

    window.onload = function(){
        StampFunc();
        const CalPrevBtn = document.querySelector('.fc-prev-button')
        const CalNextBtn = document.querySelector('.fc-next-button')

        CalPrevBtn.addEventListener('click',()=>{StampFunc()})
        CalNextBtn.addEventListener('click',()=>{StampFunc()})
    }


    //카카오 api 불러오기

    const keywords = ['국내소설', '베스트셀러', '인문', '소설', '에세이'];
    const slideCount = 7;

    //api로 데이터를 받아옵니다.
    async function fetchBooks() {
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        const response = await fetch(`https://dapi.kakao.com/v3/search/book?query=${randomKeyword}&size=15`, {
            headers: {
                Authorization: `KakaoAK ${kakaoKey}`
            }
        });
        //서버에서 받은 정보를 객체로 바꿉니다.
        const data = await response.json();
        //console.log(data)
        return data.documents.sort(() => 0.5 - Math.random()).slice(0, slideCount);
    }


    //각 slider 의 구조
    function createSlide(book) {
        const yes24Link = `https://www.yes24.com/Product/Search?domain=ALL&query=${encodeURIComponent(book.title)}`;
        const kyoboLink = `https://search.kyobobook.co.kr/web/search?vPstrKeyWord=${encodeURIComponent(book.title)}`;
        const link = Math.random() > 0.5 ? yes24Link : kyoboLink;

        return `
        <div class="swiper-slide recomand_slide">
            <div class="swiper_depth">
                <div class="book_cover">
                    <img src="${book.thumbnail}" alt="${book.title} 표지" />
                </div>
                <div class="book_desc">
                    <p class="book_title sd-b">${book.title}</p>
                    <p class="book_intro">${book.contents ? book.contents.substring(0, 200) + '...' : '설명이 없습니다.'}</p>
                    <div class="button_wrap">
                        <button class="wish common_btn red-n">Wish</button>
                        <button class="common_btn red-n" onclick="window.open('${link}', '_blank')">More View</button>
                    </div>
                </div>
            </div>
        </div>`;
    }

    //slider set
    async function initSlider() {
        const books = await fetchBooks(); //return 배열
        const wrapper = document.getElementById('bookSliderWrapper');
        wrapper.innerHTML = books.map(createSlide).join('');

        new Swiper('.my_recomand_book', {
            slidesPerView: 1.15,
            spaceBetween: 15,
            loop: true
        });
    }

    initSlider();

});

