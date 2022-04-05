class CookieManager {
    constructor() {
        this._lastCookies
    }

    get cookies() {
        str = docuement.cookie
        str = str.split(', ');
        var result = {};
        for (var i = 0; i < str.length; i++) {
            var cur = str[i].split('=');
            result[cur[0]] = cur[1];
        }
        return result;
    }

    set cookies(value) {
        Object.keys(this.cookies).forEach((value,index,array) => {
            this.deleteCookie(value)
        })
    }

    setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 86400000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    deleteCookie(cname) {
        setCookie(cname,'',-1)
    }

    checkCookie(cname) {
        //returns true if the cookie exists, false if it doesn't
        var c = getCookie(cname);
        if (c != "") {
            return true
        } else {
            return false
        }
    }
}