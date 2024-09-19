let textBox;
let msgBoard;
const updateTimeoutValue = 600000; //10 Mins

window.onload = (e) => {
    msgBoard = document.getElementById("msg-board");
    textBox = document.getElementById("text-area");
    document.getElementById("submit-but").onclick = SendMsg;
    document.getElementById("clear-but").onclick = DeleteAllPosts;
    LoadPage();
    RecivePosts();
}

const isDefined = (value) => {
    return value !== isNaN && value !== null && value !== undefined;
}

//From https://dmitripavlutin.com/timeout-fetch-request/
const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 90000 } = options; //90 sec timeout default
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
  
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    });
    clearTimeout(id);
  
    return response;
  }

//Send a msg to the server and update all clients
const SendMsg = async () => {
    let t_msg = textBox.value;
    textBox.value = "";
    if(t_msg === ""){
        return;
    }
    let t_body = {"msg": t_msg};
    await fetch("/submit-post", 
        {method: "POST",
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(t_body)}
    ).then(
        res => {
            if(res.status === 200){
                //console.log("YES!");
            }
        }, err => {
            console.error(err.message);
        }
    )
}

//Delete handler
const DeleteAllPosts = async () => {
    fetch("/clear-posts", {method: "DELETE"}).then(
        res => {
            //Do nothing
        }, err => {
            console.error(err);
        }
    )
}

//Recive updates about the posts.
const RecivePosts = async () => {
    fetchWithTimeout("/get-board", {timeout: updateTimeoutValue}).then(
        res => {
            res.json().then(data => {
                if(isDefined(data.clear) && data.clear){
                    msgBoard.innerHTML = '';
                } else if (isDefined(data.msg)){
                    SetUpMessage(data.msg);
                }
            }, err => {
                console.log(err);
            })
            RecivePosts();
        }, err => {
            console.error(err);
            RecivePosts();
        }
    );
}

//Puts a message on the board
const SetUpMessage = (message) => {
    const para = document.createElement('p');
    const node = document.createTextNode(message);
    para.appendChild(node);
    msgBoard.appendChild(para);
}

const LoadPage = async () => {
    await fetch("/get-board-full", {method: "GET"}).then(
        res => {
            res.json().then(data => {
                //console.log(data);
                data.messages.forEach(msg => {
                    SetUpMessage(msg);
                });
            })
        }, error => {
            console.error(error.message);
        }
    );
}