function Header() {
  return <h1>ログイン</h1>;
}

function LoginForm() {
  return (
    <div>
      <p style={{marginBottom:"1px"}}>E-mail</p>
        <input 
          style={{ 
            marginBottom: "5px",
            width: "250px",     
            height: "30px",    
            fontSize: "16px",
        }} 
        type="text" placeholder="E-mail" />

        <br/>

      <p style={{marginBottom:"1px"}}>パスワード</p>
        <input 
          style={{ 
            marginBottom: "40px",
            width: "250px",     
            height: "30px",     
            fontSize: "16px",
          }} 
          type="password" placeholder="パスワード" />

          <br/>


        <button 
          style={{
            width:"15%",
            padding:"5px",
            marginBottom:"20px",
            fontSize: "20px",
            backgroundColor: "black",
            color: "white",
            borderRadius: "100px"
          }}
              >
          ログイン
        </button>

      <hr style={{marginBottom:"15px"}}></hr> 

        
      <p>お持ちのアカウントでログイン</p>


      <div
        style={{
          display: "flex",          // 横並びにする
          justifyContent: "center", // 中央寄せ
          gap: "20px",              // 間のすき間
          marginTop: "30px",
        }}
          >
        {/* 左のカード */}
        <div
          style={{
              width: "150px",
              border: "1px solid #333",
              borderRadius: "10px",
              padding: "1px",
              textAlign: "right",
              gap: "30px",
              marginBottom:"15px"
          }}
            >
   
          <p style={{marginRight:"20px"}}>Google</p>

        </div>
     

        {/* 右のカード */}
        <div
          style={{
            width: "150px",
            border: "1px solid #333",
            borderRadius: "10px",
            padding: "1px",
            textAlign: "right",
            gap:"30px",
            marginBottom:"15px"
          }}
             >
          <p style={{marginRight:"20px"}}>Apple ID</p>

        </div>

      </div>

      <hr style={{marginBottom:"15px"}}></hr> 
     
    </div>  

  );
}

function Footer() {
  return <p>© 2025 My App</p>;
}

function App() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <Header />
      <LoginForm />
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
