function submitForm(element){
    var id = element.value;
    $.ajax({
        url : '/product/wishlist',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({id: id}),
        success: function(res){
            if (res.status == "add"){
                // element.classList.remove("bx-bookmarks")
                element.classList.add('bxs-bookmark')
                element.classList.add('bx-tada')
                setTimeout(function(){element.classList.remove('bx-tada')}, 1000)
            } else if (res.status == "remove") {
                // element.classList.add("bi-bookmarks")
                element.classList.remove('bxs-bookmark')
                element.classList.add('bx-tada')
                setTimeout(function(){element.classList.remove('bx-tada')}, 1000)
            }
        },
    })
}
