function ensureOneCheck(checkBoxName, messageId, submitId) {
    const checkBoxes = $('[name=' + checkBoxName + ']');
    let checkCount = 0;
    for (let i = 0; i < checkBoxName.length; i++) {
        if (checkBoxes[i].checked) {
            checkCount++
        }
    }
    if (checkCount == 0) {
        $('#' + messageId).show();
        $('#' + submitId).prop('disabled', true);
        return false;
    } else {
        $('#' + messageId).hide();
        $('#' + submitId).prop('disabled', false);
        return true;
    }
}

$('#pfpUpload').on('change', function () {
    let formdata = new FormData();
    let image = $("#pfpUpload")[0].files[0];
    formdata.append('pfpUpload', image);
    fetch('/user/upload', {
        method: 'POST',
        body: formdata
    })
        .then(res => res.json())
        .then((data) => {
            if (data.err) {
                $('#pfpErr').text(data.err.message);
                $('#pfpErr').show();
            }
            else {
                if (data.file) {
                    $('#pfp').attr('src', data.file);
                    $('#pfpURL').attr('value', data.file); // set hidden field    
                }
                $('#pfpErr').hide();
            }
        })
})

$('#image').on('change', function () {
    let formdata = new FormData();
    let image = $("#image")[0].files[0];
    console.log(image)
    formdata.append('image', image);
    console.log(formdata.get('image'))
    fetch('/admin/upload', {
        method: 'POST',
        body: formdata
    })
        .then(res => res.json())
        .then((data) => {
            console.log(data.file)
            if (data.err) {
                $('#pfpErr').text(data.err.message);
                $('#pfpErr').show();
            }
            else {
                if (data.file) {
                    $('#pfp').attr('src', data.file);
                    $('#pfpURL').attr('value', data.file); // set hidden field    
                }
                $('#pfpErr').hide();
            }
        })
})
