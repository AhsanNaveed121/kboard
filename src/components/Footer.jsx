function Footer() {
  return (
    <footer className="footer">
      <img src="/logo.svg" alt="Kboard" className="footer-logo-img" />

      <div className="footer-links">
        <span>About This Project: My first MERN Stack project, designed and developed by Ahsan Naveed. </span>
        <span>Developer Contact: [ahsan.naveed1001@gmail.com](mailto:ahsan.naveed1001@gmail.com)</span>
        <span>Built for learning and exploring full-stack web development with MongoDB, Express.js, React,
       and Node.js.</span> 
       <span>Thank you for checking out my first MERN Stack application!</span>
      </div>

      <span className="footer-copy">
        © 2026 Kboard Inc. All rights reserved.
      </span>
    </footer>
  );
}

export default Footer;