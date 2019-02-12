// $(".saveNews").on("click",function(){
//     console.log("Button clicked")    
//     $("#newsModal").modal('show');
// })
$(document).ready(function() {
    $(".toSave").on("click",(function(){
        console.log("Button clicked")    
        $("#newsModal").modal('show');
    }))
})