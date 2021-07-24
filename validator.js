function Validator(formSelector) {
    _this=this;
    
    var formRules= {};

    function getParent(element,selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
        }
        element = element.parentElement
    }


    
    var validatorRules = {
        required: function (value) {
            return value ?undefined: 'Vui lòng nhập trường này'
        },
        email: function (value) {
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value)  ? undefined: 'Nhập đúng email'
        },
        min: function (min) {
                return function(value){
                    return value.length >= min ? undefined: `Nhập tối thiểu ${min} kí tự`
                }
        }
    };


    //Lấy ra form elementt trong DOM theo 'formSelector'
    var formElement = document.querySelector(formSelector);

    //chỉ xử lí khi có element trong DOM
    if(formElement) {

        var inputs = formElement.querySelectorAll('[name][rules]')
        for(var input of inputs){

            var rules = input.getAttribute('rules').split('|')
            for(var rule of rules){
                
                var isRuleHasValue = rule.includes(':')
                var ruleInfo

                if(isRuleHasValue) {
                    ruleInfo = rule.split(':')
                    rule = ruleInfo[0]
                }

                var ruleFunc = validatorRules[rule]
                if(isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1])
                }           
                
                if(Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)

                }else{
                    formRules[input.name] = [ruleFunc]

                }

            }
            //Lắng nghe sự kiện để validate( blur ,chang...)
            input.onblur = handleValidate
            input.oninput = handleClearError

            
        }
        //Hàm handleValidate
        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errorMessage;
            var formGroup = getParent(event.target,'.form-group')

            for(var rule of rules) {
                errorMessage =rule(event.target.value)
                if(errorMessage)
                    break;

            }
        
            if(errorMessage) {
                if(formGroup) {
                    var formMessage = formGroup.querySelector('.form-message')
                    if(formMessage) {
                        formMessage.innerText = errorMessage;
                        formGroup.classList.add('invalid')
                    }
                   
                }
            }
            return errorMessage
        }
        //Hàm handleClearError
        function handleClearError(event) {
            var formGroup = getParent(event.target,'.form-group')
            if(formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid')

                var formMessage = formGroup.querySelector('.form-message')
                if(formMessage) {
                    formMessage.innerText = '';
                }
            }
        }
    }
    console.log(this)
    //Xử lí hành vi submit form form
    formElement.onsubmit = function(event) {
        event.preventDefault();

        var inputs = formElement.querySelectorAll('[name][rules]')

        var isValid = true;
        for(var input of inputs){
            if(handleValidate({ target: input})){
                isValid = false;
            }
        
        }
        if(isValid) {
            if(typeof _this.onSubmit ==='function') {

                var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                
                var formValues = Array.from(enableInputs).reduce(function(values,input){
                    
                    switch(input.type){
                        case 'radio':{
                            if(input.matches(':checked')){ 
                                values[input.name] = input.value
                            }
                            
                            break;
                        }
                        case 'checkbox':{
                            if(!input.matches(':checked')) 
                                return values;
                                
                            if(!Array.isArray(values[input.name])){
                                values[input.name] =[]
                            }
                            values[input.name].push(input.value);
                            break;
                        }
                        case 'file':{
                            values[input.name]=input.files
                            break;
                        }
                        default:
                            values[input.name] = input.value
                            break;

                    }
                    return values
                },{})         
                _this.onSubmit(formValues)
            }
            else{
                //TH submit với hành mi mặc định
                formElement.submit();

            }
        }
    }
}