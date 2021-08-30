const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const works = $('#works');
const formElement = $('#form');
const openForm = $('.openForm');
const inputs = $$('input');
const form = $('#form');
const alertSpan = $$('p');
const renderSection = $('#list-item');
const dateValid = $('.date-valid');
const addBtn = formElement.querySelector('.addTodo')

const PlAYER_STORAGE_KEY = "TODO_LIST";

const array = localStorage.getItem('todoList') ? JSON.parse(localStorage.getItem('todoList')) : []
let idOfData = array.map(item => {
    return item.id;
})

let maxId = array.length ? Math.max.apply(Math, idOfData) : 0;

const app = {

    handleEvents: function () {
        openForm.onclick = function () {
            form.classList.toggle('d-none');
        },

        addBtn.onclick = (event) => {
            event.preventDefault()
            this.add()
            this.render(array);
        }
    },

    add: () => {
        maxId += 1;
        var enableInput = formElement.querySelectorAll('input[name]')
        var formValues = Array.from(enableInput).reduce(function (values, input) {
            values[input.name] = input.value
            return values
        }, {})
        formValues['id'] = maxId
        formValues['status'] = false;

        let result = Object.keys(formValues).map((key) => formValues[key]);
        if (result.includes('')) {
            for (let key in formValues) {
                [...alertSpan].forEach(item => {
                    if (key === item.getAttribute('name') && !formValues[key]) {
                        item.classList.remove('d-none');
                    }
                })
            }
        }
        else {
            let startAtTime = new Date(formValues.startAt).getTime();
            let endAtTime = new Date(formValues.endAt).getTime();
            if (endAtTime - startAtTime < 0) {
                dateValid.classList.remove('d-none');
            }
            else {
                dateValid.classList.add('d-none');
                array.push(formValues);
                localStorage.setItem('todoList', JSON.stringify(array));
                app.render(array);
            }
        }
    },

    render: function (array) {
        let rows = array.map((item, index) => {
            return `
            <tr class="tr${item.id}">
                <td>${index + 1}</td>
                <td>${item.workName}</td>
                <td class="sm-style">${item.startAt}</td>
                <td class="sm-style">${item.endAt}</td>
                <td class="sm-style">${item.createBy}</td>
                <td><button class="btn btn-danger fas fa-times deleteTodo" data-id=${item.id}></button></td>
                <td><button class="btn btn-warning fas fa-edit editTodo" data-id=${item.id}></button></td>
                <td><button data-toggle="modal" data-target="#detailModal" class="btn btn-info fas fa-info viewTodo" data-id=${item.id}></button></td>
              </tr>
            `
        })
        renderSection.innerHTML = rows.join('');
    },

    start: function () {
        // this.loadConfig()

        //Định nghĩa thuộc tính cho object 
        // this.defineProperties()

        //Lắng nghe / xử lý các event
        this.handleEvents()

        // Tải thông tin đầu tiên 
        this.render(array)
    }
}


app.start()