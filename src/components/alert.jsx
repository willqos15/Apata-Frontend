import styles from './alert.module.css'

function Alert({titulo, descricao, bty,btn,fbty,fbtn, estado}) {


    return(
        <>
        {estado===true ? 

        <div className={styles.block}>
        <div className={styles.alertbox}>

            <div className={styles.alerttexto}>
            <h3>{titulo}</h3>
            <p>{descricao}</p>
            </div>

            <div className={styles.alertbtn}>
            <button onClick={fbty}>{bty}</button>
            <button onClick={fbtn}>{btn}</button>
            </div>

        </div>
        </div>
        : null}
        </>
    )

}

export default Alert