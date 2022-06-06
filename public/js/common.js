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