import { defaultTheme } from "../../styles/themer/utils"
const Title = ({title = 'No Title'}) => {
    return (
      <>
        <div className='feature-bar-title-row'>
          <div className='feature-bar-title-lockup'>
            <h1 className='feature-title'>{title}</h1>
          </div>
        </div>
        <style jsx>{`
        .feature-bar-title-row {
            align-items: stretch;
            display: flex;
            flex-wrap: nowrap;
            padding-right: 32px;
            padding-top: 4px;
            position: relative;
        }
        .feature-bar-title-lockup{
            margin-bottom: 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: flex;
            flex-direction: column;
            justify-content: center;
            margin-right: 20px;
            flex: 1 1 auto;
        }
        .feature-title {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: ${defaultTheme.colors.action};
            font-family: "Google Sans",sans-serif;
            font-size: 32px;
            font-weight: 500;
            line-height: 38px;
            margin: 0;
            padding: 0;
            position: relative;
            align-items: center;
            display: flex;
            flex-direction: row;
            min-width: 0;
            position: relative;
            min-height: 38px;            
        }
        `}</style>
      </>
    )
  }
  
  export default Title
  