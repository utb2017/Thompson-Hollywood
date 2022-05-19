import styles from "./styles.module.css"
function InfoMapLayout({children}) {
  return (
      <div id='layoutPage' className={styles.layout}>
        <div className={styles.layout}>
            {children}
        </div>
      </div>

  )
}
export default InfoMapLayout
