import { drizzleConnect } from 'drizzle-react'
import LoginButton from './LoginButton'
import { loginUser } from './LoginButtonActions'

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    onLoginUserClick: (event) => {
      event.preventDefault();
      dispatch(loginUser())
    }
  }
}

const LoginButtonContainer = drizzleConnect(LoginButton,
  mapStateToProps,
  mapDispatchToProps
)

export default LoginButtonContainer
