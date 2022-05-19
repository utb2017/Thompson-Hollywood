import styles from "./styles.module.css"
function InfoLayout({children}) {
  return (
    <div className={styles.info} >
      {children}
    </div>
  )
}
export default InfoLayout
