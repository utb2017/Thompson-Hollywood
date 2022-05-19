import React from "react"
import SVGIcon from "../components/SVGIcon"
import Link from "next/link"
import { defaultTheme } from "../styles/themer/utils"
import { colors } from "../styles"
import { useWindowSize } from "../hooks/useWindowSize"

function AuthLayout({
  href = null,
  as = null,
  children = <></>,
  showCrumbs = false,
  leftIconName = "help",
  leftIconColor = defaultTheme.colors.action,
  crumbs = ["default", "default"],
  title = "Title",
  caption = "Caption",
  callout = <></>,
}) {
  const { width, height } = useWindowSize()
  return (
    <div id='auth-layout'>
      <header className='auth-layout-header'>
        {showCrumbs && (
          <ul className='breadcrumb-list'>
            <li className={crumbs[0]}>
              <span>1</span>
              <span className='text'>. Add Name</span>
            </li>
            <li className={crumbs[1]}>
              <span>2</span>
              <span className='text'>. Upload ID</span>
            </li>
            {/* <li className={crumbs[2]}>
              <span>3</span>
              <span className='text'>. Upload ID</span>
            </li> */}
          </ul>
        )}
        {Boolean(href && as) && (
          <Link href={href} as={as} scroll={false}>
            <button className='button-base left-icon'>
              <SVGIcon color={leftIconColor} name={leftIconName} />
            </button>
          </Link>
        )}
      </header>

      <div style={height > 0 ? { height } : {}} className='auth-layout'>
        <div className='auth-layout-break'>
          <div className='auth-layout-content'>
            <div className='auth-layout-info'>
              <h1>{title}</h1>
              <p>{caption}</p>
              {callout}
            </div>
            <div className='auth-layout-form'>{children}</div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .button-base {
          -webkit-tap-highlight-color: transparent;
          background-color: transparent;
          border: none;
          cursor: pointer;
          font-weight: 400;
          padding: 0;
        }
        .auth-layout {
          background: #fff;
          margin: 0;
          height: 100vh;
          width: 100vw;
          display: table;
          transition: height 0.2s ease-out;
          will-change: transform, height;
        }
        .auth-layout-break {
          display: table-cell;
          vertical-align: middle;
        }
        .auth-layout-content {
          margin: 0 auto;
          max-width: 720px;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
        }
        .auth-layout-form {
          display: inline-block;
          padding: 0 24px 0 48px;
          vertical-align: middle;
          width: 50%;
        }
        .auth-layout-info {
          display: inline-block;
          padding: 0 24px 0 12px;
          vertical-align: middle;
          width: 50%;
        }
        .auth-layout-header {
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          background-color: rgb(255, 255, 255);
          display: -webkit-box;
          display: -ms-flexbox;
          display: flex;
          -webkit-box-orient: vertical;
          -webkit-box-direction: normal;
          -ms-flex-direction: column;
          flex-direction: column;
          height: 78px;
          width: 100%;
          z-index: 10;
          position: fixed;
          -webkit-box-flex: 0;
          -ms-flex: 0 0 auto;
          flex: 0 0 auto;
        }
        .auth-layout-header .left-icon {
          left: 32px;
          position: absolute;
          width: 100px;
          text-align: left;
          top: 20px;
          top: 0;
          bottom: 0;
          margin: auto;
        }
        .auth-layout-header .breadcrumb-list {
          height: 65px;
          text-align: center;
          -webkit-transition: opacity 0.15s ease-in;
          -o-transition: opacity 0.15s ease-in;
          transition: opacity 0.15s ease-in;
        }
        .auth-layout-header .breadcrumb-list li {
          border-bottom: 1px solid ${colors.GRAY_74};
          color: ${colors.GRAY_74};
          display: inline-block;
          font-size: 12px;
          letter-spacing: 1px;
          margin: 18px 6px 0;
          padding: 12px 6px;
          text-transform: uppercase;
          -webkit-transition: color 0.50s ease-in;
          -o-transition: color 0.50s ease-in;
          transition: color 0.50s ease-in;
        }
        .auth-layout-header .breadcrumb-list li.selected {
          border-bottom: 3px solid ${defaultTheme.colors.action};
          color: ${defaultTheme.colors.action};
        }
        .auth-layout-header .breadcrumb-list li.completed {
          border-bottom: 1px solid ${defaultTheme.colors.actionLight};
          color: ${defaultTheme.colors.actionLight};
        }
        @media (max-width: 767px) {
          .auth-layout-header .breadcrumb-list li {
            margin-top: 6px;
          }
          .auth-layout-header .breadcrumb-list .text {
            display: none;
          }
          .auth-layout-header {
            height: 65px;
            border-bottom: 1px solid ${colors.GRAY_74};
          }
          .auth-layout-info {
            padding: 0 24px;
            width: 100%;
          }
          .auth-layout-form {
            margin-top: 24px;
            padding: 0 24px;
            width: 100%;
          }
          .auth-layout-break {
            height: 100%;
            max-width: 375px;
            display: block;
            margin: auto;
          }
          .auth-layout-content {
            flex-direction: column;
          }
          .auth-layout-header .left-icon {
            left: 16px;
          }
        }
      `}</style>
    </div>
  )
}

export default AuthLayout
