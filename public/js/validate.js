$(document).ready(function(){
    $('#register').on('click', function(){
        console.log("Working. .");
        var name = $.trim($('#name').val());//to get name from input field we use id, trim is to trim the white spaces.
        var map = $.trim($('#map').val());
        var city = $.trim($('#city').val());
        var country = $.trim($('#country').val());
        var img = $.trim($('#upload-input').val());
        
        var isValid = true;//if there is an error then this isValid is set to false;

        
        if(name == ''){
            isValid = false;
            $('#errorMsg1').html('<div class="alert alert-danger">Name field is empty</div>');
        }else{
            $('#errorMsg1').html('');
        }
        
        if(map == ''){
            isValid = false;
            $('#errorMsg2').html('<div class="alert alert-danger">Map field is empty</div>');
        }else{
            $('#errorMsg2').html('');
        }
        
        if(city == ''){
            isValid = false;
            $('#errorMsg3').html('<div class="alert alert-danger">City field is empty</div>');
        }else{
            $('#errorMsg3').html('');
        }
        
        if(country == ''){
            isValid = false;
            $('#errorMsg4').html('<div class="alert alert-danger">Country field is empty</div>');
        }else{
            $('#errorMsg4').html('');
        }
        
        if(isValid == true){
            
            var companyData = {
                name: name,
                map: map,
                city: city,
                country: country,
                img: img
            };
            
            $.ajax({
                url: '/place/create',// we want to send it to this URL
                type: 'POST',
                data: companyData,
                success: function(data){// success is callback 
                    $('#name').val('');
                    $('#map').val('');
                    $('#city').val('');
                    $('#country').val('');
                }
            });
            
        }else{
            return false;
        }
        
    });
})










































        
        
        
        
