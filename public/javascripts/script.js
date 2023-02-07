addToCart = (proId) => {
    $.ajax({
        url: '/add-to-cart/' + proId,
        type: 'GET',
        success: (response) => {
            if(response.status){
                let count = $('#cart-count').html()
                count = parseInt(count)+1
                $("#cart-count").html(count)
            }
            alert(response)
        }
    })
}