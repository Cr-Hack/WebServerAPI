function verify_email(value){
    var result = value.match(/^(?!\.)[\w_.-]*[^.]@\w+\.\w+(\.\w+)?[^.\W]$/g)
    return result != null && result.length == 1 && result[0] == value
}
console.log(verify_email("clement.rostagni@free.de.fr"))