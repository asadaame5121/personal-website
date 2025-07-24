export default function Contact() {
    return (
      <fieldset className="bg-base-200 border-base-300 rounded-box w-xs border p-4">
      <form action="https://formspree.io/f/mzzveqgb" method="POST">
        <label className="label">名前 </label>
          <input type="text" name="name" className="input input-bordered mb-4" placeholder="Name" />
       
        <label className="label">メール </label>
          <input type="email" name="email" className="input input-bordered mb-4" placeholder="Email" />
        
        <label className="label">メッセージ </label>
          <textarea name="message" className="textarea textarea-bordered mb-4" placeholder="Message"></textarea>
        
        <button type="submit" className="btn btn-primary">Send</button>
      </form>
      </fieldset>
    );
}