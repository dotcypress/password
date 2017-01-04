import React from 'react'
import Head from 'next/head'
import md5 from 'blueimp-md5'
import copy from 'copy-to-clipboard'
import pbkdf2 from 'pbkdf2-sha256'

const bookmarklet = `javascript:window.open('https://password.now.sh/#' + new URL(document.location).host, '_blank');`
const alphabetRFC1924 = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '!', '#', '$', '%', '&', '(', ')', '*', '+', '-', ';', '<', '=', '>', '?', '@', '^', '_', '`', '{', '|', '}', '~']

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.generate = this.generate.bind(this)
    this.copy = this.copy.bind(this)
    this.keydown = this.keydown.bind(this)
    this.state = { password: '' }
  }

  componentDidMount () {
    if (document.referrer) {
      this.tldInput.value = new URL(document.referrer).host.replace(/^www./, '')
    }
    if (document.location.hash) {
      this.tldInput.value = document.location.hash.slice(1).replace(/^www./, '')
    }
    this.generate()
  }

  generate () {
    const masterPassword = this.masterPasswordInput.value
    const salt = `${this.tldInput.value}${this.usernameInput.value}`
    const password = Array.from(pbkdf2(masterPassword, salt, 1000, 32)).map((byte) => alphabetRFC1924[byte % alphabetRFC1924.length]).join('')
    this.setState({ password })
  }

  copy () {
    copy(this.state.password)
    this.passwordEl.style.animationName = 'flash'
    setTimeout(() => {
      if (this.passwordEl) {
        this.passwordEl.style.animationName = ''
      }
    }, 1000)
  }

  keydown (ev) {
    if (ev.keyCode == 13) {
      this.copy()
      if (ev.metaKey) {
        window.close()
      }
    }
  }

  render () {
    const { password } = this.state
    return (
      <div>
        <Head>
          <title>~ psswrd</title>
          <meta name='viewport' content='initial-scale=1.0, maximum-scale=1, width=device-width' />
        </Head>
        <div className='app'>
          <a className='bookmarklet' href={bookmarklet} onClick={(e) => e.preventDefault()}>~ psswrd</a>
          <div>
            <input id='tld' type='text' placeholder='tld' autoCapitalize='none' onKeyDown={this.keydown} onChange={this.generate} ref={(input) => { this.tldInput = input }} />
            <input id='username' type='text' placeholder='username' autoCapitalize='none' autoFocus onKeyDown={this.keydown} onChange={this.generate} ref={(input) => { this.usernameInput = input }} />
            <input type='password' placeholder='master password' onKeyDown={this.keydown} onChange={this.generate} ref={(input) => { this.masterPasswordInput = input }} />
            <div className='password' ref={(el) => { this.passwordEl = el }}>
              {this.masterPasswordInput && this.masterPasswordInput.value.length > 0 ? password : 'master password required'}
              <button onClick={this.copy}>copy</button>
            </div>
          </div>
          <a className='github' href='https://github.com/dotcypress/password'>github</a>
        </div>
        <style jsx global>{`
          * {
            box-sizing: border-box;
            text-rendering: geometricPrecision;
          }

          html {
            background: #263238;
          }

          body {
            color: #900068;
            font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif;
            margin: 0;
          }

          .app {
            padding: 6px 12px;
          }

          .bookmarklet {
            display: inline-block;
            color: #ff5252;
            font-size: 20px;
            font-weight: bold;
            text-decoration: none;
            margin-bottom: 12px;
          }

          .github {
            display: block;
            margin-top: 24px;
            color: #ababab;
            text-align: center;
            font-size: 10px;
          }

          input {
            background: #263238;
            color: #2b98f0;
            font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif;
            font-size: 18px;
            width: 100%;
            padding: 6px 0;
            border: none;
            outline: none;
            text-shadow: 0px 0px 0px #000;
          }

          .password {
            color: #9ccc65;
            border: double 6px #9ccc65;
            border-radius: 0;
            font-size: 14px;
            line-height: 20px;
            padding: 6px;
            margin-top: 12px;
            animation-duration: 900ms;
            animation-fill-mode: both;
            position: relative;
          }

          .password button {
            cursor: pointer;
            font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif;
            font-size: 12px;
            line-height: 20px;
            font-weight: bold;
            color: #7e7b65;
            background: none;
            border: none;
            outline: none;
            position: absolute;
            right: 12px;
            top: 6px;
            padding: 6px 12px;
            margin: -6px -12px;
          }

          .password button:hover {
            color: #fee94e;
          }

          @keyframes flash {
            from, 50%, to {
              border-color: #9ccc65;
              color: #9ccc65;
            }

            25%, 75% {
              color: #263238;
            }
          }

          @media (min-width: 420px) {
            .app {
              width: 380px;
              margin: auto;
            }
          }
        `}</style>
      </div>
    )
  }
}

