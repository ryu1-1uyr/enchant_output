enchant();
console.log("");
let game,scene;

const  MAX_ROW = 15; // 縦のマス数
const  MAX_COL = 8; // 横のマス数
const  CELL_SIZE = 16; // マスのサイズ(ぷよのpxサイズ)
const PUYOS_IMG = "puyo.png";



const main = () => {
    game = new Core(320,320);
    scene  = game.rootScene;
    game.fps = 60;
    game.preload('puyo.png');
    game.keybind(32, 'a'); // スペースバーにAボタンを割り当て



    game.on('load',()=>{

        const field = new Array(15); // フィールドの色のデータ　なんか不恰好
        for (let i=0; i<field.length; i++) {
            let temp_array = [];
            for (let j=0; j<8; j++){ //横マス
                if (j == 0 || j == 7 || i == 14) {  //縦、横マスの数
                    temp_array[j] = 0; // ブロック(壁)を配置
                } else{
                    temp_array[j] = -1; // 空
                }
            }
            field[i] = temp_array;
        }
        const map = new Map(16, 16)

        map.image = game.assets[PUYOS_IMG];     // mapにぷよ画像を読みこませる
        map.loadData(field);    // mapにフィールドを読みこませる

        scene.addChild(map);

    });
    game.start();
};




window.addEventListener('load',main());