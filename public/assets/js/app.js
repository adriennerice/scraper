$(document).ready(function() {
    $(".toSave").on("click",(function(event){
        console.log("Button clicked")    
        $("#newsModal").modal('show');
    }))

    // Scrape click event
    $('#scrape').on('click', function(event){
        event.preventDefault();
        $.ajax({
            url: '/scrape',
            type: 'GET'  
        }).then(function(){
            console.log("Scrapped")
            // location.reload();
            $('#scrapeModal').modal('toggle');
        })
    });

    // Save article click event
    $('.saveBtn').click(function(event){
        event.preventDefault();
        console.log("save Button pushed")
        const buttonId = $(this).attr('id');

        $.ajax({
            url: '/save/' + buttonId,
            type: "PUT"
        }).then(function(data){
            console.log(data);
            console.log("Article saved")
        })
    });

    // Remove article from saved status click event
    $('.deleteNews').click(function(event){
        event.preventDefault();
        console.log("delete article Button pushed")
        const buttonId = $(this).attr('id');

        $.ajax({
            url: '/delete/' + buttonId,
            type: "PUT"
        }).then(function(data){
            console.log("Article deleted")
            location.reload();
        })
    });

  

    // Open Note Modal and populate notes
    $(".addNote").click(function(event){
        event.preventDefault();

        const buttonId = $(this).attr('id');
        console.log(buttonId)
        $('#saveNote').attr('data', buttonId)

        $.ajax({
            url: "/getNotes/" + buttonId,
            type: 'GET'
        }).then(function(data){
            console.log(data.notes.length);
            console.log(data)

            $('#notesSaved').empty();
            if(data.notes.length > 0){
                
                data.notes.forEach(item => {
                    $('#notesSaved').append("<li class='list-group-item'>" + item.noteText + "<button type='button' class='btn btn-danger btn-sm float-right' id='btnDelete' data="+ item._id +">X</button></li>");
                })
            }
            else {
                $('#notesSaved').append("<li class='list-group-item'>No notes available</li>");
            }
            $('#noteModal').modal('toggle')
        })
    });

    // Save note
    $('#saveNote').click(function(event){
        event.preventDefault();

        const buttonId = $(this).attr('data');
        const noteText = $('#noteBody').val().trim();
        

        console.log(buttonId)
        // Clear out note input box
        $('#noteBody').val('');

        $.ajax({
            url: '/note/' + buttonId, 
            type: "POST",
            data: {noteText: noteText}
        })
        .then(function(data){
            console.log(data);
        })

        $("#noteModal").modal("toggle");
    })

    // Delete note
    $("#btnDelete").click(function(event){
        event.preventDefault();
        console.log("Hello")
        const buttonId = $(this).attr("data");
        console.log(buttonId);

        $.ajax({
            url: '/note/' + buttonId,
            type: "PUT"
        })
        .then(function() {
            location.reload();
        })
    })
    
})