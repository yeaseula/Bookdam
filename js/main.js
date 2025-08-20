document.addEventListener('DOMContentLoaded', function () {

    const $ = (node) => document.querySelector(node);

    const sheetId = '1EiQpFub62jL2VZOULwozl_f3hkz1J-wVec9rcSbR5CU';
    const gid = '1116419757';

    const MyReviewThumb = [];

    //section1 관련 함수
    //skeleton loading

    async function loadingSkeleton () {
        try {
            const { gsap } = await import("gsap");
            gsap.registerEffect({
                name: 'skeleton',
                effect: (targets, config) => {
                    return gsap.to(targets,
                    { scale: config.scale, x:config.x, duration:config.duration, transformOrigin:config.transformOrigin });
                },
                defaults: {scale: 0.2, x: '+=5', duration:0.5, transformOrigin: '50% 50%'},
                extendTimeline: true
            })

            let tl = gsap.timeline({ repeat: -1, yoyo:true });
            tl.skeleton('#circle1')
            tl.skeleton('#circle1',{x:'-=5'})
            tl.skeleton('#circle2',{x:'-=5'},0)
            tl.skeleton('#circle2',0.5)
        } catch(err) {
            console.error('Skeleton 생성 실패', err)
        }
    }
    requestAnimationFrame(loadingSkeleton)

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

        //console.log(books) //books 배열 첫번째의 제목을 가져옴
        let readingBooktitle = books[0].title;
        let readingBookpage = books[0].readPage;
        const booknextparticle = pickObjectParticle(readingBooktitle)
        const contentArea = $('.my-reading-state');

        contentArea.innerHTML = `
            <img src="./assets/img/bulb-img.webp" loading="lazy" alt="전구모양 3d 아이콘">
            <p>현재 <span class="reading-name sd-bb">${readingBooktitle}</span>${booknextparticle} 읽고 계시네요!<br>
            <span class="reading-page sd-bb">${readingBookpage}페이지</span>까지 읽었어요.</p>`
        }

    readingBookmark();

    //지금까지 n권의 책을 읽었어요.
    function readHistory(){
        const readHistory = $('.my-reading-history');
        const bookNumber = stampDates.length;
        //console.log(bookNumber)
        readHistory.innerHTML = `
        <p>지금까지 <span class="reading-book sd-bb">${bookNumber}권</span>의 책을 읽었어요!</p>`
    }

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
    //메인 상단 스와이퍼 초기화
    async function sliderView() {
        try {
            let MyBookList;
            const [{ default: Swiper }, { Autoplay, Keyboard, A11y }] = await Promise.all([
                import('swiper'),
                import('swiper/modules')
            ]);
            MyBookList = new Swiper('.my-book-list', {
                modules: [Autoplay, Keyboard, A11y],
                slidesPerView: 'auto',
                loop: true,
                centeredSlides : true,
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },
                a11y: {
                    enabled: true,
                },
                keyboard: {
                    enabled: true,
                    onlyInViewport: true,
                },
            });
            return MyBookList;
        } catch(err) {
            console.error('Swiper 초기화 실패:',err)
        }
    }

    //메인 상단 슬라이드 노드 구성
    function MainSlideThumb(MyBookList){
        const slideContainer = MyBookList.slides;
        slideContainer.forEach((ele)=>{
            const {swiperSlideIndex:targetindex} = ele.dataset;
            const index = Number(targetindex);
            const thumb = MyReviewThumb[index];
            if (thumb) {
                ele.style.backgroundImage = `url('${thumb}')`;
            } else {
                ele.style.backgroundImage = `url('./assets/img/cover-thumbnail.svg')`; // 또는 기본 이미지
            }
        })
    }

    //캘린더 북 스탬프
    var calendarEl = document.getElementById('calendar');
    var initialLocaleCode = 'en';
    let calendar;

    //기록 날짜를 불러와 캘린더 객체의 date키 값과 일치하는지 확인한 후 스탬프를 찍습니다.
    const stampDates = [];

    async function Calendarview () {
        try {
            const [{ Calendar }, { default: dayGridPlugin }] = await Promise.all([
                import('@fullcalendar/core'),
                import('@fullcalendar/daygrid')
            ]);
            calendar = new Calendar(calendarEl, {
            plugins: [dayGridPlugin],
            initialView: 'dayGridMonth',
                headerToolbar: {
                    left:'',
                    right: 'prev,next',
                    center: 'title',
                },
                locale:initialLocaleCode,
            });
            calendar.render();
            document.getElementById('calendar-skeleton').style.display = 'none';
        } catch(err) {
            console.error('fullcalendar 로딩 실패 :',err)
        }
    }

    function StampFunc () {
        let calendarbox = document.querySelectorAll('.fc-scrollgrid-sync-table td');
        let dayList = [...Array.from(calendarbox)];
        //console.count('StampFunc 호출 횟수');
        dayList.forEach((ele,idx)=>{
            let {date:dayValue} = dayList[idx].dataset;
            stampDates.forEach((ele,idx2)=>{
                if (dayValue == stampDates[idx2]) {
                    dayList[idx].classList.add('simple')
                }
            })
        })
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
        try {
            const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
            const res = await fetch(url);
            const text = await res.text();
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
        }catch(err) {
            console.error('google 데이터 로드 실패:',err)
        }
    };

    //google 데이터 로드 후 순차적 실행
    async function MainLoad () {
        await loadReviewDetail();
        readHistory();

        await Calendarview();
        StampFunc();

        const addCalBtnListeners = () => {
            const CalPrevBtn = document.querySelector('.fc-prev-button');
            const CalNextBtn = document.querySelector('.fc-next-button');
            if (CalPrevBtn && CalNextBtn) {
                CalPrevBtn.addEventListener('click', () => { StampFunc() });
                CalNextBtn.addEventListener('click', () => { StampFunc() });
            } else {
                // 버튼이 아직 없으면 다음 프레임에 재시도
                requestAnimationFrame(addCalBtnListeners);
            }
        };
        addCalBtnListeners();

        const MyBookList = await sliderView();
        MainSlideThumb(MyBookList);
        //data 로드 완료+슬라이드 초기화 후 스켈레톤 UI 숨김처리
        document.getElementById('my-book-skeleton').style.display = 'none';
        document.getElementById('my-book-list').style.opacity = '1';
    }

    MainLoad().catch(error => console.error('메인데이터 호출 실패:',error))


    //카카오 api 불러오기
    const keywords = ['소설', '러브', '사랑', '우정', '희망'];
    const slideCount = 7;

    //마지막 섹션 AI 추천
    async function fetchBooks() {
        try {
            const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
            const response = await fetch(`https://dapi.kakao.com/v3/search/book?query=${randomKeyword}&size=15`, {
                headers: {
                    Authorization: `KakaoAK ${kakaoKey}`
                }
            });
            const data = await response.json();
            //console.log(data)
            return data.documents.sort(() => 0.5 - Math.random()).slice(0, slideCount);
        } catch(err) {
            console.error('kakao api 로드 실패:',err)
        }
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
                    <img src="${book.thumbnail}" alt="${book.title} 표지" loading="lazy" />
                </div>
                <div class="book-desc">
                    <p class="book-title sd-b">${book.title}</p>
                    <p class="book-intro">${book.contents ? book.contents.substring(0, 200) + '...' : '설명이 없습니다.'}</p>
                    <div class="button-wrap">
                        <button class="gray-style-btn wish-btn red-n" data-title="${book.title}" data-author="${book.authors?.[0] || '작자미상'}" data-price="${book.price || 0}"><span>Wish</span></button>
                        <button class="dark-style-btn red-n" onclick="window.open('${link}', '_blank')"><span>More View</span></button>
                    </div>
                </div>
            </div>
        </div>`;
    }

    //swiper active 외의 slide는 키보드 포커스 금지
    function updateInertAttribute(swiper) {
        swiper.slides.forEach((slide, index) => {
            if (index === swiper.activeIndex) {
                slide.removeAttribute('inert');
            } else {
                slide.setAttribute('inert', '');
            }
        });
    }

    async function recomandSwiperView () {
        const [{ default: Swiper }, { Autoplay, Keyboard, A11y, Navigation }] = await Promise.all([
            import('swiper'),
            import('swiper/modules')
        ]);
        try {
            return new Swiper('.my-recomand-book', {
                modules: [Autoplay, Keyboard, A11y, Navigation],
                slidesPerView: 1.15,
                spaceBetween: 15,
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },
                loop: true,
                a11y: { enabled: true },
                keyboard: { enabled: true, onlyInViewport: true },
                navigation: {
                    nextEl: '.next-slide',
                    prevEl: '.prev-slide',
                },
            });
        } catch (error) {
            throw error;
        }
    }
    //slider set
    async function initSlider() {
        const books = await fetchBooks();
        const wrapper = document.getElementById('bookSliderWrapper');
        wrapper.innerHTML = books.map(createSlide).join('');

        // 렌더링이 완료된 후에 Swiper 초기화
        await new Promise(requestAnimationFrame);
        try {
            const recomandedAi = await recomandSwiperView();
            document.getElementById('slider-skeleton').style.display = 'none';
            calendarEl.style.display = 'block';
            recomandedAi.on('slideChange',function(){
                updateInertAttribute(this);
            })
            // console.log('swiper 초기화 완료', recomandedAi);
        } catch (error) {
            console.error('swiper 초기화 실패', error);
        }

        wrapper.addEventListener('click',(e)=>{
            if(e.target.closest('.wish-btn')) {
                const btn = e.target.closest('.wish-btn');
                if(!btn) return;

                const book = {
                    title:btn.dataset.title,
                    author:btn.dataset.author,
                    totalPrice:parseInt(btn.dataset.price,10),
                    totalPage: parseInt(btn.dataset.page, 10)
                };
                saveWishBook(book);
                window.renderWishList();
                alert('읽고싶은 책 목록에 추가됐습니다!');
            }
        })
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

    requestAnimationFrame(() => {
        initSlider();
    });

});

