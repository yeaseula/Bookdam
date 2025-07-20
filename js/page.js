document.addEventListener('DOMContentLoaded', function () {

    const $ = (node) => document.querySelector(node);
    

    //main slider
    const MyBookList = new Swiper('.my_book_list', {
        slidesPerView: 'auto',
        loop: true,
        centeredSlides : true,
    });

    //main slider2
    const MyRecomandBoook = new Swiper('.my_recomand_book', {
        slidesPerView: 1.15,
        loop: true,
        spaceBetween:15,

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


    //footer my information toggle
    const Copytogglebtn = $('#footer-toggle');

    Copytogglebtn.addEventListener('click',()=>{
        const Copytogglecont = $('.copyright-dropdown');
        const hasCont = Copytogglecont.classList.contains('active');

        if(!hasCont) {
            Copytogglecont.classList.add('active');
        } else {
            Copytogglecont.classList.remove('active');
        }
    })

});

