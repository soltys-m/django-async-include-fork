$(document).ready(function(){
    var context = {{context|safe}};
    var request_frequency = "{{request__frequency}}";
    var post_data = {
        path: "{{template_path}}",
        language_code: "{{ language_code }}",
        context: context
    };

    // Make request function as an unique name
    make_request__{{block_id}} = function (){
        // Delete previous content unless it is the spinner, of course
        $("#{{block_id}}").children(":not(.async_included-spinner)").remove();

        // Show the spinner
        // Note that we try to don't change layout in next requests forcing it to have block's final width
        if(request_frequency != "once"){
            var block_display = $("#{{block_id}}").css("display");
            $("#{{block_id}}").children(".async_included-spinner").css("display", block_display);
        }else{
            $("#{{block_id}}").children(".async_included-spinner").show();
        }

        // Make the AJAX request
        $.ajax({
            type: "POST",
            url: "{% url 'async_include:get_template' %}",
            processData: false,
            contentType: 'application/json',
            data: JSON.stringify(post_data),
            success: function(response_data) {
                if(request_frequency == "once"){
                    $("#{{block_id}}").html(response_data);
                    $("#script_{{block_id}}").remove();
                }else{
                    $("#{{block_id}}").append(response_data);
                    var block_width = $("#{{block_id}}").width();
                    $("#{{block_id}}").children(".async_included-spinner").width(block_width).hide();
                }
            },
            error: function(response_data){
                if(request_frequency != "once"){
                    clearInterval(make_request_interval_{{block_id}}_id);
                }
            }
        });
    };
    if(request_frequency == "once"){
        make_request__{{block_id}}();
    } else if($.isNumeric(request_frequency) && request_frequency > 0){
        make_request__{{block_id}}();
        make_request_interval_{{block_id}}_id = setInterval(make_request__{{block_id}}, request_frequency*1000);
    }
});