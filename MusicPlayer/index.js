
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const songs = [
        {
            name :  'Như Mùa Tuyết Đầu Tiên',
            singer :  'Văn Mai Hương',
            part: './assets/music/NhuMuaTuyetDauTien.mp3',
            image: './assets/img/NhuMuaTuyetDauTien.jpeg',
        },
        {
            name: 'If',
            singer: 'Từ Vi',
            part: './assets/music/If.mp3',
            image: './assets/img/If.jpeg',
        },
        {
            name: 'Con Nợ Mẹ',
            singer: 'Trịnh Đình Quang',
            part: './assets/music/ConNoMe.mp3',
            image: './assets/img/ConNoMe.jpeg',
        },
        {
            name: 'Chưa Bao Giờ',
            singer: 'Trung Quân Idol',
            part: './assets/music/ChuaBaoGio.mp3',
            image: './assets/img/ChuaBaoGio.jpeg',
        },
        {
            name: 'Bạn Lòng',
            singer: 'Hồ Quang Hiếu',
            part: './assets/music/BanLong.mp3',
            image: './assets/img/BanLong.jpeg',
        },
        {
            name: 'Bức Tranh Truyền Kiếp',
            singer: 'Dương Triệu Vũ',
            part: './assets/music/BucTranhTruyenKiep.mp3',
            image: './assets/img/BucTranhTruyenKiep.jpeg',
        },
        {
            name: 'Nghĩ Về Cha ',
            singer: 'Hoài Lâm ',
            part: './assets/music/NghiVeCha.mp3',
            image: './assets/img/NghiVeCha.jpeg',
        },
        {
            name: 'Giá Ngày Đầu Đừng Nói Thương Nhau',
            singer: 'Issac',
            part: './assets/music/GiaNgayDauDungNoiThuongNhau.mp3',
            image: './assets/img/GiaNgayDauDungNoiThuongNhau.jpeg',
        }
        
    ]

const playlist = $('.playlist')
const cd = $('.cd')
const headingName = $('header h2')
const headingSinger = $('header h5')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const PlAYER_STORAGE_KEY = "PLAYER";

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRanDom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
    songs,

    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PlAYER_STORAGE_KEY,JSON.stringify(this.config))
        console.log(this.config)
    },

    render: function () {
        const htmls =  this.songs.map((song,index)=>{
            return ` 
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = '${index}'>
                <div class="thumb" style="background-image:
                    url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('')

    },

    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function(){ 

        // Xử lý phóng to, thu nhỏ  CD 
        const cdWidth = cd.offsetWidth
        document.onscroll = function(){
            const scrollTop = document.documentElement.scrollTop || window.scrollY
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth    
        }

        // Xử lý CD quay
        const cdAnimate = cd.animate([
            {
                transform: 'rotate(360deg)'
            }
        ],{
            duration:10000,
            iterations: Infinity
        })

        cdAnimate.pause()

        // Xử lý play, pause 
        playBtn.onclick = function () {
            if(app.isPlaying){
                audio.pause();
            }else{
                audio.play();
            }
        }
        // Khi play
        audio.onplay = function () {
            app.isPlaying = true
            player.classList.add('playing')
            cdAnimate.play()

        }

        // Khi pause
        audio.onpause = function () {
            app.isPlaying = false
            player.classList.remove('playing')
            cdAnimate.pause()
        }

        //Khi thay đổi tiến độ
        audio.ontimeupdate = function () {
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100 )
                progress.value = progressPercent
            }
        }
        //Xử lý khi tua 

        progress.oninput = function(e){
            audio.currentTime = audio.duration /100 * e.target.value
        }

        //Khi next
        nextBtn.onclick = function(){
            if(app.isRanDom){
                app.playRandomSong()
            }else{
                app.nextSong()
            }
            
            audio.play()
            app.render()
            app.scrollToActiveSong()
        }

        //Khi prev
        prevBtn.onclick = function () {
            if(app.isRanDom){
                app.playRandomSong()
            }else{
                app.prevSong()
            }
            audio.play()
            app.render()
            app.scrollToActiveSong()
        }

        //Khi random
        randomBtn.onclick = function () {
            app.isRanDom = !app.isRanDom;
            app.setConfig('isRandom', app.isRandom) 
            randomBtn.classList.toggle('active',app.isRanDom)
        }

        //Khi repeat
        repeatBtn.onclick = function () {
            app.isRepeat = !app.isRepeat;
            app.setConfig('isRepeat', app.isRepeat)
            repeatBtn.classList.toggle('active',app.isRepeat)
            
        }

        //Xử lý khi ended
        audio.onended = function () {
            if(app.isRepeat){
                audio.play()
            }else{nextBtn.click()}
        }


        //Click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode|| e.target.closest('.option')){
                if(songNode){
                    app.currentIndex = Number(songNode.dataset.index)
                    app.loadCurrentSong()
                    app.render()
                    audio.play()
                }
                if(e.target.closest('.option')){

                }
            }
        }
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        randomBtn.classList.toggle("active", app.isRandom);
        repeatBtn.classList.toggle("active", app.isRepeat);
    },

    nextSong:function () {
        this.currentIndex ++ 
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong:function () {
        this.currentIndex--
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    playRandomSong: function () {
        let newCurrent;
        do{
            newCurrent = Math.floor(Math.random() * this.songs.length)
            console.log(newCurrent)
        }while(newCurrent === this.currentIndex)

        this.currentIndex = newCurrent

        this.loadCurrentSong()
    },



    scrollToActiveSong:function () {
        setTimeout(function(){
            if (this.currentIndex <= 3) {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'end',
                });
            } else {
                $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    },300)
        
    },
    
    loadCurrentSong: function () {
        //Load thông tin
        headingName.textContent = this.currentSong.name
        headingSinger.textContent = this.currentSong.singer
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.part
    },

    start: function () {
        this.loadConfig()

        //Định nghĩa thuộc tính cho object 
        this.defineProperties()

        //Lắng nghe / xử lý các event
        this.handleEvents()

        // Tải thông tin đầu tiên 
        this.loadCurrentSong()
        this.render()
    }

}

app.start()