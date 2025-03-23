import { config } from "dotenv";
import OpenAI from "openai";

// Load .env.local file
config({ path: ".env.local" });

// OpenAI 인스턴스 생성
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

export async function openAiRequest(
  base64Image: string,
  text: string
): Promise<string> {
  const prompt = `당신은 칼로리 분석가입니다. 사진에 나와있는 음식이 무엇인 지 찾은 후 해당 음식에 대한 칼로리를 정확하게 알려주세요. 예를 들어, 방울토마토 3개가 있다면 방울토마토 1개 칼로리를 찾은 후 1개 방울토마토 칼로리 * 3을 해주세요. 양을 추정하기 어려울 때는 음식이 무엇인 지 찾은 후 한국인 여성 평균 식사량을 추정하여 계산해주세요. 도시락과 같이 한 접시에 반찬이 여러개 있을 때는 반찬 양이 적으니, 칼로리를 예상보다 작게 추정해주세요. 텍스트가 함께 들어오면 텍스트를 기준으로 칼로리를 측정해주세요. 텍스트에 몇 명에서 나눠먹었다는 말이 있으면 칼로리를 잘 나눠주세요. 예를 들어 셋이 먹었어요 라는 텍스트가 들어오면 총 칼로리 / 3을 해주세요. 칼로리를 자세하게 분석해주세요. 예를 들어, 367Kcal 이 나오면 367Kcal이라고 정확하게 알려주세요.
답변은 꼭 예시 json 처럼 주세요. 예시: { "ai_text": "쌀밥, 떡볶이, 김말이,, 깻잎무침 등 따라서 총 칼로리는 약 890 kcal 입니다.", "items": "쌀밥, 떡볶이, 김말이, 쥐포, 깻잎무침,", "total_calories": 890 }

너는 첨부한 사진과 사용자가 먹었다고 하는 음식 문구를 기준으로 칼로리를 예측하는 영양사야. 
                        주어진 정보가 부족하지만 최대한 비슷한 칼로리로 추론해. 
                        그리고 텍스트를 우선으로 칼로리 계산해줘.
                        몇명이서 나눠먹은것에 대하여 칼로리를 잘 나눠줘.
                        예시: 셋이 먹었어요, 총 칼로리 / 3
                        대답은 숫자로만 해줘 예시: 354. 
                        그리고 칼로리를 디테일 하게 작성해줘. 1단위로 작성해줘 예를들어 367 칼로리가 나오면 360이라 적지말고 367이라고 정확하게 적어줘.
                        그리고 json형식으로 total_calories는 따로넣고, 추론결과는 어떻게 추론했는지 따로 작성해.
                        실제 json처럼 주고 다른 텍스트는 적지 말아줘.
                        제로라고 적혀진 음식은 칼로리가 제로인걸로 해줘.
                        꼭 밑에 예시 json 처럼 줘야 돼.
                        예시: { 
                                  "ai_text": "쌀밥 305kcal, 떡볶이 200kcal, 김말이 150kcal, 쥐포 50kcal, 깻잎무침 20kcal, 양념만두 180kcal, 미니돈가스 140kcal 따라서 총 칼로리는 약 890 kcal 입니다.",
                                  "items": "쌀밥, 떡볶이, 김말이, 쥐포, 깻잎무침, 양념만두, 미니돈가스",
                                  "total_calories": 890
                              }
                        첨부한 텍스트는 "${text}" 이거야.
                        자 이제 답변해주세요. 답변은 반드시 single json object여야합니다. 다른 문장을 추가하지 마세요 특히 \`\`\`json을 쓰지 마세요.`;

  const prompt2 = `너는 첨부한 사진과 사용자가 먹었다고 하는 음식 문구를 기준으로 칼로리를 예측하는 영양사야. 
                        주어진 정보가 부족하지만 최대한 비슷한 칼로리로 추론해. 
                        그리고 텍스트를 우선으로 칼로리 계산해줘.
                        몇명이서 나눠먹은것에 대하여 칼로리를 잘 나눠줘.
                        예시: 셋이 먹었어요, 총 칼로리 / 3
                        대답은 숫자로만 해줘 예시: 354. 
                        그리고 칼로리를 디테일 하게 작성해줘. 1단위로 작성해줘 예를들어 367 칼로리가 나오면 360이라 적지말고 367이라고 정확하게 적어줘.
                        그리고 json형식으로 total_calories는 따로넣고, 추론결과는 어떻게 추론했는지 따로 작성해.
                        실제 json처럼 주고 다른 텍스트는 적지 말아줘.
                        kcal가 먼저나오고 그담에 양이 괄호안에 들어가는 식으로 적어줘.
                        제로라고 적혀진 음식은 칼로리가 제로인걸로 해줘.
                        꼭 밑에 예시 json 처럼 줘야 돼.
                        예시: { 
                                  "ai_text": "쌀밥 305kcal(210g), 떡볶이 200kcal(1/3 인분), 김말이 150kcal(3개), 쥐포 50kcal(1/3 인분) 깻잎무침 20kcal(1개), 양념만두 180kcal(3개), 미니돈가스 140kcal(2개) 따라서 총 칼로리는 약 890 kcal 입니다.",
                                  "items": "쌀밥, 떡볶이, 김말이, 쥐포, 깻잎무침, 양념만두, 미니돈가스",
                                  "total_calories": 890
                              }
                        첨부한 텍스트는 "${text}" 이거야.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: base64Image,
              detail: "low",
            },
          },
        ],
      },
    ],
  });

  const aiText = response.choices[0].message.content;
  if (aiText === null) {
    throw new Error("님 오픈 ai 리턴값 null");
  }
  return aiText;
}
