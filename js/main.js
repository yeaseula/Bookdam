document.addEventListener('DOMContentLoaded', function () {

    const $ = (node) => document.querySelector(node);
    const sheetId = '1EiQpFub62jL2VZOULwozl_f3hkz1J-wVec9rcSbR5CU';
    const gid = '1116419757';

    const MyReviewThumb = [];
    const kakaoKey = '7ef7831f0d6b81e970b30f0cdfa6a4a2';

    //메인 상단 슬라이드 정의
    const MyBookList = new Swiper('.my-book-list', {
        slidesPerView: 'auto',
        loop: true,
        centeredSlides : true,
        autoplay:true
    });

    //kakao api로 북커버 호출 함수
    async function fetchMyReviewCover(title,author) {
        try {
            const query = `${title} ${author}`;
            const apiUrl = `https://dapi.kakao.com/v3/search/book?target=all&query=${encodeURIComponent(query)}`;

            const res = await fetch(apiUrl, {
                headers: {
                    Authorization: `KakaoAK ${kakaoKey}`
                }
            });
            const data = await res.json();
            const filtered = data.documents.find(book =>
                book.title.includes(title) && book.authors.join(',').includes(author)
            );

            return (filtered || data.documents[0])?.thumbnail || '';

            } catch (e) {
                console.error('카카오 API 오류:', e);
                return '';
            }
    }

    //메인 상단 슬라이드 노드 구성
    function MainSlideThumb(){
        //기본 슬라이드 10장
        const slideContainer = MyBookList.slides;

        //console.log(slideContainer)
        slideContainer.forEach((ele)=>{
            const {swiperSlideIndex:targetindex} = ele.dataset;
            const index = Number(targetindex);
            const thumb = MyReviewThumb[index];

            if (thumb) {
                ele.style.backgroundImage = `url('${thumb}')`;
            } else {
                ele.style.backgroundImage = `url('assets/img/main-empty.png')`; // 또는 기본 이미지
            }
            // ele.style.backgroundImage = `url('${MyReviewThumb[index]}')`;
        })
    }

    //캘린더 북 스탬프
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

    //기록 날짜를 불러와 캘린더 객체의 date키 값과 일치하는지 확인한 후 스탬프를 찍습니다.
    const stampDates = [];

    function StampFunc () {
        let calendarbox = document.querySelectorAll('.fc-scrollgrid-sync-table td');
        let dayList = [...Array.from(calendarbox)];
        dayList.forEach((ele,idx)=>{
            let {date:dayValue} = dayList[idx].dataset;
            stampDates.forEach((ele,idx2)=>{
                if (dayValue == stampDates[idx2]) {
                    dayList[idx].classList.add('simple')
                }
            })
        })
    }

    //prev,next 버튼 누를 시 캘린더 초기화
    window.onload = function(){
        const CalPrevBtn = document.querySelector('.fc-prev-button')
        const CalNextBtn = document.querySelector('.fc-next-button')

        CalPrevBtn.addEventListener('click',()=>{StampFunc()})
        CalNextBtn.addEventListener('click',()=>{StampFunc()})
    }

    //google 시트의 날짜 형식 변환 함수
    function sheetDateFormat(rawDate) {
        const dateMatch = rawDate.match(/Date\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!dateMatch) return rawDate;
            const year = dateMatch[1];
            const month = String(Number(dateMatch[2]) + 1).padStart(2, '0'); // 0부터 시작
            const day = String(dateMatch[3]).padStart(2, '0');
            return `${year}-${month}-${day}`;
    }

    //google 시트에 기록된 데이터 불러오기
    async function loadReviewDetail() {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
        const text = await fetch(url).then(r => r.text());
        const json = JSON.parse(
            text
                .replace("/*O_o*/", "")
                .replace("google.visualization.Query.setResponse(", "")
                .slice(0, -2)
        );

        const rows = json.table.rows;

        for(const row of rows) {
            //캘린더에 필요한 데이터
            const endDateRaw = row.c[5]?.v || '';

            // 날짜 형식 변환
            const endDate = sheetDateFormat(endDateRaw);
            stampDates.push(endDate);

            //메인 슬라이드에 필요한 데이터
            const title = row.c[2]?.v || '';
            const author = row.c[3]?.v || '';

            const thumb = await fetchMyReviewCover(title,author);
            MyReviewThumb.unshift(thumb);
        }
        StampFunc();
        readHistory();
        MainSlideThumb();
    }

    loadReviewDetail();


    //카카오 api 불러오기
    const keywords = ['소설', '러브', '사랑', '우정', '희망'];
    const slideCount = 7;

    //마지막 섹션 AI 추천
    async function fetchBooks() {
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        const response = await fetch(`https://dapi.kakao.com/v3/search/book?query=${randomKeyword}&size=15`, {
            headers: {
                Authorization: `KakaoAK ${kakaoKey}`
            }
        });
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
        <div class="swiper-slide recomand-slide">
            <div class="swiper-depth">
                <div class="book-cover">
                    <img src="${book.thumbnail}" alt="${book.title} 표지" />
                </div>
                <div class="book-desc">
                    <p class="book-title sd-b">${book.title}</p>
                    <p class="book-intro">${book.contents ? book.contents.substring(0, 200) + '...' : '설명이 없습니다.'}</p>
                    <div class="button-wrap">
                        <button class="gray-style-btn wish-btn red-n" data-title="${book.title}" data-author="${book.authors?.[0] || '작자미상'}" data-price="${book.price || 0}">Wish</button>
                        <button class="dark-style-btn red-n" onclick="window.open('${link}', '_blank')">More View</button>
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

        new Swiper('.my-recomand-book', {
            slidesPerView: 1.15,
            spaceBetween: 15,
            loop: true
        });

        //wish 버튼 클릭->로컬에 데이터 저장
        setTimeout(() => {
            document.querySelectorAll('.wish-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                const book = {
                    title: this.dataset.title,
                    author: this.dataset.author,
                    totalPrice: parseInt(this.dataset.price, 10),
                    totalPage: parseInt(this.dataset.page, 10)
                };
                saveWishBook(book);
                window.renderWishList();
                alert('읽고싶은 책 목록에 추가됐습니다!')
                });
            });
        }, 0);
    }

    function getBooks(key, sample = []) {
        return JSON.parse(localStorage.getItem(key)) || sample;
    }

    function saveWishBook(newBook) {
        const books = getBooks(STORAGE_KEY2, []);
        const isExist = books.some(b => b.title === newBook.title && b.author === newBook.author);
        if (!isExist) {
            books.unshift(newBook);
            localStorage.setItem(STORAGE_KEY2, JSON.stringify(books));
        }
    }

    initSlider();


    //section1 관련 함수
    //조사 을/를 선택
    function pickObjectParticle(word) {
        if (!word) return '';
        const lastChar = word[word.length - 1];
        // 한글 유니코드 범위 내에서 받침(종성) 여부 판별
        const uni = lastChar.charCodeAt(0);
        if (uni < 0xac00 || uni > 0xd7a3) return '를'; // 한글이 아니면 '를'
        return ((uni - 0xac00) % 28) ? '을' : '를';
    }

    //읽고있는 책 정보 로컬스토리지에서 불러오기
    function readingBookmark(){
        //json문자열을 객체로 가져오기
        const books = JSON.parse(localStorage.getItem('readingBooks') || '[]');

        console.log(books) //books 배열 첫번째의 제목을 가져옴
        let readingBooktitle = books[0].title;
        let readingBookpage = books[0].readPage;
        const booknextparticle = pickObjectParticle(readingBooktitle)
        const contentArea = $('.my-reading-state');

        contentArea.innerHTML = `
            <img src="/assets/img/bulb.png">
            <p>현재 <span class="reading-name sd-bb">${readingBooktitle}</span>${booknextparticle} 읽고 계시네요!<br>
            <span class="reading-page sd-bb">${readingBookpage}페이지</span>까지 읽었어요.</p>`
            }

    readingBookmark();

    //지금까지 n권의 책을 읽었어요.
    function readHistory(){
        const readHistory = $('.my-reading-history');
        const bookNumber = stampDates.length;
        console.log(bookNumber)
        readHistory.innerHTML = `
        <p>지금까지 <span class="reading-book sd-bb">${bookNumber}권</span>의 책을 읽었어요!</p>`
    }

});

