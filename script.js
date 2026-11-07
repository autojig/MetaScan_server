// ======================================================
// Supabase 설정
// ======================================================

const SUPABASE_URL =
  "https://vanfljdaqodgbumtomih.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_eTnnqkluDjqV-pmySH8GEg_xiVLi1nn";


let supabaseClient = null;


// Supabase 연결
if (SUPABASE_URL.startsWith("https://")) {

  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

  const dbStatus = document.getElementById("db-status");

  dbStatus.innerText = "🟢 Supabase DB 연결됨";

  dbStatus.className =
    "text-xs text-emerald-400 bg-emerald-950 border border-emerald-700 px-3 py-1.5 rounded-lg";
}



// ======================================================
// 기본 물 정보
// Supabase에서 데이터를 못 가져올 경우 사용
// ======================================================

const defaultWaterTips = [

  {
    category: "🌡️ 물의 온도 (Temperature)",

    title:
      "찬물(4°C) vs 미지근한 물(15~20°C)",

    content:
      "기상 직후나 단식 중에는 체온과 유사한 미지근한 물이 위장관 혈류를 촉진합니다. 반면 고강도 러닝·웨이트 직후에는 10~15°C의 약간 시원한 물이 심부 체온을 낮추고 위 배출 속도를 높여 흡수가 가장 빠릅니다."
  },


  {
    category: "⏰ 골든 타임 (Timing)",

    title:
      "기상 직후 300ml & 식전 30분 200ml",

    content:
      "수면 중 호흡과 땀으로 빠져나간 수분 때문에 아침 혈액 점도가 가장 높습니다. 기상 직후 마시는 물 1잔은 신진대사를 24% 깨우고, 식사 30분 전 물 1잔은 포만감 수용체를 자극해 과식과 혈당 스파이크를 억제합니다. (식사 도중 다량의 물은 소화액을 희석하므로 피하세요.)"
  },


  {
    category: "☕ 카페인과의 상호작용 (Caffeine)",

    title:
      "아메리카노는 물이 아닙니다",

    content:
      "카페인은 항이뇨호르몬(ADH)을 억제해 마신 양의 약 1.2~1.5배 수분을 소변으로 배출시킵니다. 특히 아침 기상 직후 코르티솔 수치가 높을 때 빈속에 커피부터 마시면 탈수와 피로가 가중되므로, 반드시 물 1잔을 마신 뒤 1시간 뒤에 커피를 드세요."
  },


  {
    category:
      "⚡ 간헐적 단식 & 근합성 (Metabolism)",

    title:
      "단식 중 두통과 근손실을 막는 수분 법칙",

    content:
      "공복 시간이 16시간을 넘어가면 인슐린 수치가 낮아지면서 신장이 수분과 나트륨을 빠르게 배출합니다. 단식 중 어지럽거나 힘이 빠진다면 물 부족 및 전해질 고갈 신호이며, 근육 세포 내 수분이 3%만 줄어도 근합성 효율과 중량 수행 능력이 10% 이상 급감합니다."
  }

];



// ======================================================
// 화면 전환
// ======================================================


// 음식 목록 보여주기
function showFoodList() {

  document
    .getElementById("step-question")
    .classList.add("hidden");

  document
    .getElementById("step-food-list")
    .classList.remove("hidden");

}



// 물 상세 페이지 열기
async function openWaterDetail() {

  document
    .getElementById("step-food-list")
    .classList.add("hidden");

  document
    .getElementById("step-water-detail")
    .classList.remove("hidden");


  calculateWater();

  await loadWaterTips();

}



// 처음 화면으로 돌아가기
function resetToHome() {

  document
    .getElementById("step-water-detail")
    .classList.add("hidden");

  document
    .getElementById("step-question")
    .classList.remove("hidden");

}



// ======================================================
// 수분 섭취량 계산
// ======================================================

function calculateWater() {

  const weight = parseFloat(
    document.getElementById("input-weight").value
  );

  const coffee = parseFloat(
    document.getElementById("input-coffee").value
  );

  const workout = parseFloat(
    document.getElementById("input-workout").value
  );


  // 화면의 숫자 업데이트

  document.getElementById("label-weight").innerText =
    weight;

  document.getElementById("label-coffee").innerText =
    coffee;

  document.getElementById("label-workout").innerText =
    workout;



  /*
    계산식

    기본 수분량
    = 체중 × 0.033 L

    커피 보정
    = 커피 잔 수 × 0.2 L

    운동 보정
    = 30분당 0.35 L
  */

  const totalLiters =
    (weight * 0.033) +
    (coffee * 0.2) +
    (workout * (0.35 / 30));


  const roundedLiters =
    totalLiters.toFixed(2);


  // 200ml 컵 기준
  const cups =
    (totalLiters * 5).toFixed(1);



  document.getElementById(
    "result-liters"
  ).innerText = roundedLiters;


  document.getElementById(
    "result-cups"
  ).innerText =
    `종이컵(200ml) 기준 약 ${cups}잔 · 커피 보충분 +${coffee * 200}ml 포함`;

}



// ======================================================
// 물 관련 지식 불러오기
// ======================================================

async function loadWaterTips() {

  const container =
    document.getElementById("tips-container");


  container.innerHTML = "";


  // 기본적으로 로컬 데이터 사용
  let tipsToRender = defaultWaterTips;



  // Supabase가 연결되어 있다면 DB에서 가져오기

  if (supabaseClient) {

    const { data, error } =
      await supabaseClient
        .from("water_knowledge")
        .select("*")
        .order("id", { ascending: true });


    if (
      !error &&
      data &&
      data.length > 0
    ) {

      tipsToRender = data;

    }

  }



  // HTML 카드 생성

  tipsToRender.forEach((tip) => {

    const card =
      document.createElement("div");


    card.className =
      "bg-slate-800/80 border border-slate-700/70 rounded-xl p-3.5";


    card.innerHTML = `

      <div class="text-xs font-bold text-cyan-400 mb-1">
        ${tip.category}
      </div>

      <div class="text-sm font-bold text-white mb-1.5">
        ${tip.title}
      </div>

      <div class="text-xs text-slate-300 leading-relaxed">
        ${tip.content}
      </div>

    `;


    container.appendChild(card);

  });

}



// ======================================================
// 사용자 계산 결과 Supabase에 저장
// ======================================================

async function saveUserLogToDB() {

  const weight =
    parseFloat(
      document.getElementById("input-weight").value
    );


  const coffee =
    parseInt(
      document.getElementById("input-coffee").value
    );


  const workout =
    parseInt(
      document.getElementById("input-workout").value
    );


  const targetLiters =
    parseFloat(
      document.getElementById("result-liters").innerText
    );


  const msgEl =
    document.getElementById("save-msg");


  msgEl.classList.remove("hidden");



  // Supabase 연결이 안 된 경우

  if (!supabaseClient) {

    msgEl.innerText =
      "✅ [로컬 테스트 완료] Supabase URL/Key를 넣으면 실제 클라우드 DB에 저장됩니다!";

    return;

  }



  // Supabase INSERT

  const { error } =
    await supabaseClient
      .from("water_user_logs")
      .insert([
        {
          weight_kg: weight,
          coffee_cups: coffee,
          workout_mins: workout,
          recommended_liters: targetLiters
        }
      ]);



  if (error) {

    msgEl.innerText =
      "⚠️ DB 저장 에러: " +
      error.message;

  } else {

    msgEl.innerText =
      "🎉 Supabase 클라우드 DB에 내 수분 계산 기록이 저장되었습니다!";

  }

}