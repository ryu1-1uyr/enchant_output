enchant();

let game,scene;




const main = () => {
    game = new Core(300,300);
    scene  = game.rootScene;


    game.on('load',()=>{
        // scene.addChild();

    });
    game.start();
};




window.addEventListener('load',main());