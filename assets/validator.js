
function Validator(formSelector){
    var formRules={}
    var _this=this
    function getParent(element,selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement
            }else{
                element=element.parentElement
            }
        }

    }

    var validatorRules={
        required: function(value){
            return value ? undefined: "Vui lòng nhập trường này"
        },
        email: function(value){
            var regex=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined: "Email không hợp lệ"
        },
        min: function(min){
            return  function(value){
                return value.length >= min ? undefined: `Vui lòng nhập ít nhất ${min} ký tự`
            }
        },
        max: function(max){
            return  function(value){
                return value.length <= max ? undefined: `Vui lòng nhập tối đa ${max} ký tự`
            }
        }
    }

    var formElement=document.querySelector(formSelector)
    if(formElement){
        var inputs=formElement.querySelectorAll('[name][rules]')
        for(var input of inputs){
            var rules=input.getAttribute('rules').split('|')
            for(var rule of rules){

                var ruleInfo
                var isRuleHasValue=rule.includes(':')

                if(isRuleHasValue){
                    ruleInfo=rule.split(':')
                    rule=ruleInfo[0]
                }

                var ruleFunc=validatorRules[rule]
                if(isRuleHasValue){
                    ruleFunc=ruleFunc(ruleInfo[1])
                }

                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc)
                }else{
                    // console.log(rule)       
                    formRules[input.name]=[ruleFunc]
                }
            }
            input.onblur=handleValidate
            input.oninput=handleClearError

            function handleValidate(e){

                var rules=formRules[e.target.name]
                // var errorMessage=rules.some(rule=>rule(e.target.value))
                // console.log(errorMessage)
                
                for(var i=0;i<rules.length;i++){
                    var errorMessage=rules[i](e.target.value)
                    if(errorMessage)
                        break
                }
                if(errorMessage){
                    var formGroup=getParent(e.target,'.form-group')
                    if(!formGroup) return
                    formGroup.classList.add('invalid')
                    var formMessage=formGroup.querySelector('.form-message')
                    formMessage.innerText=errorMessage
                }
                return !errorMessage
            }
            function handleClearError(e){
                var formGroup=getParent(e.target,'.form-group')
                if(formGroup.classList.contains('invalid')){
                    formGroup.classList.remove('invalid')
                    var formMessage=formGroup.querySelector('.form-message')
                    formMessage.innerText=''
                }
            }
        }
        console.log(formRules)
    }
    //Xử lý hành vi submit form
    formElement.onsubmit=function(event){
        event.preventDefault()
        var inputs=formElement.querySelectorAll('[name][rules]')
        var isValid=true;
        for(var input of inputs){
            if(!handleValidate({target: input})){
                isValid=false
            }
        }
        //Khi không có lỗi thì submit form
       if(isValid){
            if(typeof _this.onSubmit==='function'){
                var enableInputs=formElement.querySelectorAll('[name]:not([disable])')
                var fromValues=Array.from(enableInputs).reduce((values,input)=>{
                     switch(input.type){
                         case 'radio':
                             values[input.name]=formElement.querySelector('input[name="'+input.name+'"]:checked').value
                             break
                         case 'checkbox':
                             if(!input.matches(':checked')){
                                 values[input.name]=''
                                 return values
                             }
                             if(!Array.isArray(values[input.name])){
                                 values[input.name]=[]
                             }
                             values[input.name].push(input.value)
                         break
                         case 'file':
                             values[input.name]=input.files
                         break
                         default:
                             values[input.name]=input.value
                     }
                    return values
                },{})
                _this.onSubmit(fromValues)
            }else{
                formElement.submit()
            }
       }
    }
}