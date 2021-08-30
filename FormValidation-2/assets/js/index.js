function Validator(formSelector) {

    var _this = this
    var formRules = {}

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Vui lòng nhập chính xác email'
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
            }
        },
        max: function (max) {
            return function (value) {
                return value.length <= max ? undefined : `Vui lòng nhập tối đa ${max} ký tự`
            }
        }
    }

    var formElement = document.querySelector(formSelector)
    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]')

        for (var input of inputs) {
            var ruleInfo;
            var rules = input.getAttribute('rules').split('|')

            for (var rule of rules) {
                var isRuleValid = rule.includes(":")
                if (isRuleValid) {
                    ruleInfo = rule.split(':')
                    rule = ruleInfo[0]
                }
                var ruleFunction = validatorRules[rule]

                if (isRuleValid) {
                    ruleFunction = ruleFunction(ruleInfo[1])
                }
                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunction)
                }
                else {
                    formRules[input.name] = [ruleFunction]
                }
            }

            //Lắng nghe sự kiện để validate
            input.onblur = handleValidate
            input.oninput = handleClearError
        }

        //Hàm thực hiện Validate
        function handleValidate(event) {
            var rules = formRules[event.target.name]
            var errorMessage
            for (var rule of rules) {
                errorMessage = rule(event.target.value)

                if (errorMessage) break
            }


            if (errorMessage) {
                var formGroup = getParent(event.target, '.form-group')
                if (formGroup) {
                    formGroup.classList.add('invalid')
                    var formMessage = formGroup.querySelector('.form-message')
                    if (formMessage) {
                        formMessage.innerText = errorMessage
                    }
                }
            }
            return !errorMessage
        }
        //Hàm thực hiện clear Message lỗi
        function handleClearError(event) {
            var formGroup = getParent(event.target, '.form-group')
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid')
                var formMessage = formGroup.querySelector('.form-message')
                if (formMessage) {
                    formMessage.innerText = ''
                }
            }
        }
    }

    formElement.onsubmit = function (event) {
        event.preventDefault()
        var inputs = formElement.querySelectorAll('[name][rules]')
        var isValid = true
        for (var input of inputs) {
            if (!handleValidate({ target: input })) {

            }
        }
        if (isValid) {
            if (typeof _this.onSubmit === 'function') {
                var enableInput = formElement.querySelectorAll('[name]')
                var formValues = Array.from(enableInput).reduce(function (values, input) {
                    switch (input.type) {
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                            break
                        case 'checkbox':
                            if (!input.matches(':checked')) {
                                values[input.name] = ''
                                return values
                            }
                            if (!Array.isArray(values[input.name])) {
                                values[input.name] = []
                            }
                            values[input.name].push(input.value)
                            break

                        case 'file':
                            values[input.name] = input.files
                            break
                        default:
                            values[input.name] = input.value
                    }
                    return values
                }, {})
                _this.onSubmit(formValues)
            }
            else {
                formElement.submit()
            }
        }

    }

}