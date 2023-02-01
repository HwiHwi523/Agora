import googleLogo from "../../assets/login/btn_google_signin_light_normal_web@2x.png"

function GoogleBtn () {
    const GOOGLE_AUTH_URL = `http://localhost:9999/oauth2/authorization/google`

    return (
        <div>
            <a id="google-login-btn" href={GOOGLE_AUTH_URL}>
                <img 
                    src={googleLogo}
                    width="222"
                    alt="구글 로그인 버튼" />
                </a>
        </div>
    )
}

export default GoogleBtn;