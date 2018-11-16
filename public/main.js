enchant();
let game,scene;

const  MAX_ROW = 15; // 縦のマス数
const  MAX_COL = 8; // 横のマス数
const  CELL_SIZE = 16; // マスのサイズ(ぷよのpxサイズ)
const PUYOS_IMG = "puyopuyo.png";


const createPuyo = Class.create( Sprite , { //何がダメなんこれ
    initialize: function() {
        Sprite.call(this,16,16);
        this.image = PUYOS_IMG ;
        this.frame = Math.floor(Math.random()*4+1);
        this.moveTo(0, 0);
    }

});

// const createPuyo = game => {
//     const puyo = new Sprite(CELL_SIZE, CELL_SIZE);
//     puyo.image = game.assets[PUYOS_IMG];
//     puyo.frame = Math.floor(Math.random()*4+1); // ランダムに色を選択
//     puyo.moveTo(0, 0);
//     return puyo;
// };

const createPair = (game, map, field) => {
    const pair = new Group();
    const rotationPuyo = createPuyo(game);  // 回る側の操作ぷよ
    const axisPuyo = createPuyo(game);  // 軸側の操作ぷよ
    const forms = [[0, -CELL_SIZE], [CELL_SIZE, 0], [0, CELL_SIZE], [-CELL_SIZE, 0]]; // 操作ぷよの形
    let formNum = 0;                    // 操作ぷよの形の番号。フォームナンバ
    /* キー押下カウント */
    let inputRightCount = 0;
    let inputLeftCount = 0;
    pair.isFall = true;            // 落下中、つまり操作出来る状態かどうか
    pair.addChild(rotationPuyo);             // 操作ぷよをシーンに追加
    pair.addChild(axisPuyo);
    rotationPuyo.y = - CELL_SIZE ;     // 回る側のぷよの初期位置を軸ぷよの一つ上へ
    pair.moveTo(CELL_SIZE*3, CELL_SIZE); // グループの初期位置を操作ぷよ出現場所へ

    //闇の処理
    pair.addEventListener("enterframe", function() {
        // フレーム毎の処理
        // キー連続押下カウントの更新 闇の処理
        inputRightCount = game.input.right ? inputRightCount+1 : 0;
        inputLeftCount = game.input.left ? inputLeftCount+1 : 0;
        inputACount = game.input.a ? inputACount+1 : 0;

        /* 回転 */
        if (inputACount == 1) {
            const newFormNum = (formNum+1) % 4; // 回転した場合のフォームナンバ
            const newX = forms[newFormNum][0];  // 回転先のx
            const newY = forms[newFormNum][1];  // 回転先のy
            if (!map.hitTest(this.x+newX, this.y+newY)) { // 回転可能判定
                formNum = newFormNum;
                rotationPuyo.moveTo(newX, newY);
            }
        }

        // 横移動
        let newX = 0;                   // 横移動先のx
        if (inputRightCount == 1) {
            newX = formNum==1 ? rotationPuyo.x+CELL_SIZE : axisPuyo.x+CELL_SIZE;
        }
        if (inputLeftCount == 1) {
            newX = formNum==3 ? rotationPuyo.x-CELL_SIZE : axisPuyo.x-CELL_SIZE;
        }
        if (!map.hitTest(this.x+newX, this.y+rotationPuyo.y) && !map.hitTest(this.x+newX, this.y+axisPuyo.y)) { // 移動可能判定
            this.x = this.x + (newX ? newX >= 0 ? 1 : -1 : 0)*CELL_SIZE;
        }

        // 落下
        newY = formNum == 2 ? rotationPuyo.y + CELL_SIZE : axisPuyo.y + CELL_SIZE;
        let vy = Math.floor(game.input.down ? game.fps/10 : game.fps/1); // 落下速度の設定 (10や1などの数値は何マス毎秒か
        if (game.frame%vy == 0) {
            if (!map.hitTest(this.x+rotationPuyo.x, this.y+newY) && !map.hitTest(this.x+axisPuyo.x, this.y+newY)) { // 移動可能判定
                this.y += CELL_SIZE;
            } else {                    // 着地した場合
                /* フィールドに操作ぷよを追加 */
                field[(this.y+rotationPuyo.y)/CELL_SIZE][(this.x+rotationPuyo.x)/CELL_SIZE] = rotationPuyo.frame;
                field[(this.y+axisPuyo.y)/CELL_SIZE][(this.x+axisPuyo.x)/CELL_SIZE] = axisPuyo.frame;
                pair.isFall = false; // 着地したので落下中フラグをfalseに
            }
        }
    });


    return pair;
};

const  countPuyos = (row, col, field) => {
    const c = field[row][col];    // ぷよの色
    let n = 1;                  // 1で初期化しているのは自分もカウントするため。
    field[row][col] = -1; // この場所をチェックした証として一時的に空白に
    if (row-1>=2 && field[row-1][col]==c) {
        n += countPuyos(row-1, col, field)
    };
    if (row+1<=MAX_ROW-2 && field[row+1][col]==c) {
        n += countPuyos(row+1, col, field)
    };
    if (col-1>=1 && field[row][col-1]==c) {
        n += countPuyos(row, col-1, field)
    };
    if (col+1<=MAX_COL-2 && field[row][col+1]==c) {
        n += countPuyos(row, col+1, field)
    };
    field[row][col] = c;                // 色を戻す
    return n;
};

const addScore = () =>{
    game.score += 10;
    document.getElementById("score").innerText = game.score;
};
/**
 * 指定された場所のぷよを消す
 * 隣接されたぷよが同じ色だった場合は再帰呼び出す
 *
 */
const  deletePuyos = (row, col, field) => {
    const c = field[row][col];    // ぷよの色
    field[row][col] = -1;               // ぷよを空に
    if (row-1>=2 && field[row-1][col] == c) {
        deletePuyos(row-1, col, field);
        addScore();
    };
    if (row+1<=MAX_ROW-2 && field[row+1][col] == c) {
        deletePuyos(row+1, col, field);
        addScore();
    };
    if (col-1>=1 && field[row][col-1] == c) {
        deletePuyos(row, col-1, field);
        addScore();
    };
    if (col+1<=MAX_COL-2 && field[row][col+1] == c) {
        deletePuyos(row, col+1, field);
        addScore();
    };
}
/**
 * 下が空いているぷよを落とした状態にするよう
 * フィールドを更新し、落ちたぷよの数を返す
 *
 * @field {Array} フィールドの色情報が格納された二次元配列
 * @return {Number} 落ちたぷよの数
 */
const freeFall = field => {
    let c = 0;                                  // おちたぷよの数
    for (let i = 0; i < MAX_COL; i++) {
        let spaces = 0;
        for (let j=MAX_ROW-1; j>=0; j--) {
            if (field[j][i] == -1) {
                spaces ++
            } else if (spaces >= 1) {     // 落ちるべきぷよがあった場合
                field[j+spaces][i] = field[j][i];
                field[j][i] = -1;
                c ++;
            }
        }
    }
    return c;
};

/**
 * 連鎖処理
 * 消去と自動落下を繰り返して連鎖を終了させる
 * 自動落下が発生しなかった場合は再帰呼び出しをせずに終了
 *
 * @field {Array} フィールドの色情報が格納された二次元配列
 */
const chain = field => {
    for (let i = 0; i < MAX_ROW; i++) {
        for (let j = 0; j < MAX_COL; j++) {
            if (field[i][j]>=1 && countPuyos(i, j, field)>=4){ // 同じ色のぷよが４つながっていた場合
                deletePuyos(i, j, field); // ぷよを消去
            };
        }
    }
    if (freeFall(field) >= 1) {
        chain(field)
    }; // 自由落下したぷよがあった場合は再帰
};

const makeField = field => {
    for (let i = 0; i < field.length; i++) {
        let temp_array = [];
        for (let j = 0; j < 8; j++){ //横マス
            if (j == 0 || j == 7 || i == 14) {  //縦、横マスの数
                temp_array[j] = 0; // ブロック(壁)を配置
            } else {
                temp_array[j] = -1; // 空
            }
        }
        field[i] = temp_array;
    }
    const map = new Map(16, 16);

    map.image = game.assets[PUYOS_IMG];     // mapにぷよ画像を読みこませる
    map.loadData(field);    // mapにフィールドを読みこませる

    return map
};

const main = () => {
    game = new Core(320,320);
    scene  = game.rootScene;
    game.fps = 60;
    game.preload('puyopuyo.png');
    game.keybind(32, 'a'); // スペースバーにAボタンを割り当て
    game.score = 0;

    game.on('load',() => {
        const field = new Array(15); // フィールドの色のデータ　なんか不恰好
        const map = makeField(field);

        scene.addChild(map);

        let pair = createPair(game, map, field); // 操作するぷよ２つを作成
        scene.addChild(pair);   // 操作ぷよをシーンに追加

        scene.on("enterframe", function() { // １フレームごとに呼び出される関数を登録
            if (!pair.isFall) {                  // 操作ぷよの着地判定
                scene.removeChild(pair); // 操作ぷよをシーンから削除
                freeFall(field);                 // 自由落下
                chain(field);                    // 連鎖処理
                map.loadData(field);     // マップの再読み込み
                if (field[2][3] != -1) { // ゲームオーバー判定
                    game.stop();
                    alert("Game Over");
                } else {
                    /* 操作ぷよを更新、シーンに追加 */
                    pair = createPair(game, map, field);
                    scene.addChild(pair);
                }
            }
        });

    });
    game.start();
};


window.addEventListener('touchstart',main());