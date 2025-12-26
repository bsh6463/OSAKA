import streamlit as st
import json
import os
from datetime import datetime

# --- 페이지 설정 ---
st.set_page_config(
    page_title="Osaka Diary with 꾸꾸",
    page_icon="👶",
    layout="centered"
)

# --- 데이터 파일 경로 ---
DATA_FILE = "osaka_data.json"

# --- 초기 데이터 정의 (React 버전과 동일) ---
DEFAULT_DATA = {
    "checklist": {
        "필수 서류": [{"name": "여권", "checked": False, "memo": ""}, {"name": "엔화/트래블카드", "checked": False, "memo": ""}, {"name": "유심/이심", "checked": False, "memo": ""}, {"name": "여행자 보험", "checked": False, "memo": ""}, {"name": "임산부 뱃지", "checked": False, "memo": ""}],
        "세안/화장품": [{"name": "클렌징폼/오일", "checked": False, "memo": ""}, {"name": "기초 화장품", "checked": False, "memo": ""}, {"name": "선크림/쿠션", "checked": False, "memo": ""}, {"name": "샤워볼/치약칫솔", "checked": False, "memo": ""}],
        "생활용품": [{"name": "가습기(필수)", "checked": False, "memo": ""}, {"name": "돼지코(110v)", "checked": False, "memo": ""}, {"name": "보조배터리", "checked": False, "memo": ""}, {"name": "편한 잠옷/속옷", "checked": False, "memo": ""}, {"name": "압박스타킹", "checked": False, "memo": ""}]
    },
    "saved_places": [
        {"name": "멘야 타케이", "desc": "우메다 츠케멘 명점", "link": "https://www.google.com/maps/search/?api=1&query=Menya+Takei+Hankyu+Umeda"},
        {"name": "스키야키 호쿠토", "desc": "임산부 기력 보충", "link": "https://www.google.com/maps/search/?api=1&query=Sukiyaki+Hokuto"},
        {"name": "HARBS", "desc": "크레이프 케이크", "link": "https://www.google.com/maps/search/?api=1&query=HARBS+Daimaru+Shinsaibashi"},
        {"name": "아카짱혼포", "desc": "아기용품 쇼핑", "link": "https://www.google.com/maps/search/?api=1&query=Akachan+Honpo+Honmachi"},
        {"name": "하나다코", "desc": "네기마요 타코야키", "link": "https://www.google.com/maps/search/?api=1&query=Hanadako+Umeda"},
        {"name": "모토무라 규카츠", "desc": "규카츠 맛집", "link": "https://www.google.com/maps/search/?api=1&query=Motomura+Gyukatsu+Osaka"}
    ],
    "itinerary": {
        "Day 1 (12/27)": [
            {"time": "05:30", "title": "집 출발", "desc": "인천공항 장기주차장 이동", "icon": "🚗"},
            {"time": "12:30", "title": "간사이 공항 점심", "desc": "카마타케 우동", "icon": "🍜"},
            {"time": "15:30", "title": "호텔 체크인", "desc": "쉐라톤 미야코 오사카", "icon": "🏨"},
            {"time": "18:00", "title": "이치란 라멘", "desc": "난바/도톤보리점", "icon": "🍜"},
            {"time": "20:30", "title": "편의점 쇼핑", "desc": "내일 아침거리(타마고산도)", "icon": "🏪"}
        ],
        "Day 2 (12/28)": [
            {"time": "11:00", "title": "아카짱혼포", "desc": "혼마치 본점 (택시 이동)", "icon": "👶"},
            {"time": "13:30", "title": "스키야키 호쿠토", "desc": "점심 식사", "icon": "🥩"},
            {"time": "15:30", "title": "HARBS", "desc": "다이마루 백화점 디저트", "icon": "🍰"},
            {"time": "18:30", "title": "저녁 자유식", "desc": "도톤보리 산책", "icon": "🚶"}
        ],
        "Day 3 (12/29)": [
            {"time": "12:00", "title": "KITASUSHI", "desc": "우메다 스시 점심", "icon": "🍣"},
            {"time": "14:00", "title": "하나다코", "desc": "타코야키 간식", "icon": "🐙"},
            {"time": "15:30", "title": "우메다 쇼핑", "desc": "한큐 백화점 등", "icon": "🛍️"},
            {"time": "18:30", "title": "MARUYA HONTEN", "desc": "루쿠아 10층 장어덮밥", "icon": "🍱"}
        ],
        "Day 4 (12/30)": [
            {"time": "13:00", "title": "아베노 하루카스", "desc": "전망대 & 텐노지 공원", "icon": "🏙️"},
            {"time": "17:30", "title": "츠케멘 맛집", "desc": "저장된 리스트 중 선택", "icon": "🍜"},
            {"time": "19:30", "title": "마지막 쇼핑", "desc": "킨테츠 백화점 (숙소 옆)", "icon": "🛍️"}
        ],
        "Day 5 (12/31)": [
            {"time": "10:00", "title": "체크아웃", "desc": "짐 보관", "icon": "🧳"},
            {"time": "12:00", "title": "마지막 만찬", "desc": "백화점 식당가", "icon": "🍽️"},
            {"time": "14:10", "title": "공항 리무진", "desc": "호텔 앞에서 탑승", "icon": "🚌"},
            {"time": "18:00", "title": "비행기 탑승", "desc": "ZE614 (간사이 -> 인천)", "icon": "✈️"}
        ]
    }
}

# --- 데이터 로드/저장 함수 ---
def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return DEFAULT_DATA

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

# --- 세션 상태 초기화 ---
if "data" not in st.session_state:
    st.session_state.data = load_data()

# --- 스타일 커스텀 (CSS) ---
st.markdown("""
    <style>
    .main {
        background-color: #F8FAFC;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 10px;
    }
    .stTabs [data-baseweb="tab"] {
        background-color: #ffffff;
        border-radius: 10px;
        padding: 10px 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .stTabs [aria-selected="true"] {
        background-color: #6366f1 !important;
        color: white !important;
    }
    .card {
        background-color: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        margin-bottom: 15px;
        border: 1px solid #e2e8f0;
    }
    .flight-card {
        border-left: 5px solid #6366f1;
    }
    .highlight {
        color: #6366f1;
        font-weight: bold;
    }
    </style>
""", unsafe_allow_html=True)

# --- 헤더 ---
st.markdown("# 🧸 Osaka Diary <span style='color:#f472b6'>with 꾸꾸</span>", unsafe_allow_html=True)
st.caption("📅 2025.12.27 ~ 12.31 (4박 5일) | 🏨 쉐라톤 미야코 오사카")

# --- 탭 구성 ---
tabs = st.tabs(["✅ 준비물", "✈️ 항공/공항", "🗓️ 일정표", "❤️ 저장됨"])

# --------------------------------------------------------------------------------
# 탭 1: 체크리스트
# --------------------------------------------------------------------------------
with tabs[0]:
    st.markdown("### 📝 여행 준비물 체크리스트")
    st.info("💡 체크박스를 누르면 자동 저장됩니다.")
    
    checklist = st.session_state.data["checklist"]
    
    for category, items in checklist.items():
        with st.expander(f"📌 {category}", expanded=True):
            for i, item in enumerate(items):
                col1, col2 = st.columns([0.1, 0.9])
                with col1:
                    checked = st.checkbox(
                        "", 
                        value=item["checked"], 
                        key=f"check_{category}_{i}",
                        label_visibility="collapsed"
                    )
                with col2:
                    # 체크 상태 업데이트 및 저장
                    if checked != item["checked"]:
                        item["checked"] = checked
                        save_data(st.session_state.data)
                        st.rerun()
                    
                    # 메모 입력 (엔터 치면 저장됨)
                    new_memo = st.text_input(
                        label=item["name"],
                        value=item["memo"],
                        placeholder="메모 입력...",
                        key=f"memo_{category}_{i}",
                        label_visibility="collapsed" if item["memo"] else "visible"
                    )
                    if new_memo != item["memo"]:
                        item["memo"] = new_memo
                        save_data(st.session_state.data)

                # 아이템 이름 표시 (체크되면 취소선)
                st.markdown(
                    f"<div style='margin-top: -35px; margin-left: 30px; margin-bottom: 10px; color: {'#94a3b8' if checked else '#1e293b'}; text-decoration: {'line-through' if checked else 'none'}; font-weight: bold;'>{item['name']}</div>", 
                    unsafe_allow_html=True
                )

# --------------------------------------------------------------------------------
# 탭 2: 항공/공항
# --------------------------------------------------------------------------------
with tabs[1]:
    st.markdown("### 🛫 항공권 정보 (이스타항공)")
    
    # 가는 편
    st.markdown("""
    <div class="card flight-card">
        <h4>🛫 가는 날 (12/27 금)</h4>
        <p><strong>ZE615</strong> | 09:55 인천(ICN) → 11:45 간사이(KIX)</p>
        <p style='color:#64748b; font-size: 0.9em;'>ℹ️ 인천공항 T1 | 패스트트랙 이용 필수</p>
    </div>
    """, unsafe_allow_html=True)
    
    # 오는 편
    st.markdown("""
    <div class="card flight-card" style="border-left-color: #f472b6;">
        <h4>🛬 오는 날 (12/31 화)</h4>
        <p><strong>ZE614</strong> | 18:00 간사이(KIX) → 20:30 인천(ICN)</p>
        <p style='color:#64748b; font-size: 0.9em;'>ℹ️ 간사이공항 T1 | 임산부 우선 탑승 요청</p>
    </div>
    """, unsafe_allow_html=True)

    st.warning("🤰 **임산부 꿀팁:** 인천공항 T1 체크인 카운터에서 '교통약자 우대카드'를 꼭 받으세요! 동반인까지 패스트트랙 출국이 가능합니다.")

# --------------------------------------------------------------------------------
# 탭 3: 일정표
# --------------------------------------------------------------------------------
with tabs[2]:
    days = list(st.session_state.data["itinerary"].keys())
    selected_day = st.selectbox("날짜를 선택하세요", days)
    
    st.markdown(f"### {selected_day}")
    
    events = st.session_state.data["itinerary"][selected_day]
    
    # 일정 리스트 표시
    for i, event in enumerate(events):
        with st.container():
            st.markdown(f"""
            <div class="card">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-weight:bold; color:#6366f1; font-family:monospace;">{event['time']}</span>
                    <span style="font-size:1.5em;">{event['icon']}</span>
                </div>
                <h4 style="margin: 5px 0;">{event['title']}</h4>
                <p style="color:#64748b; margin:0;">{event['desc']}</p>
            </div>
            """, unsafe_allow_html=True)
            
            # 구글 맵 버튼
            if "query" in event:
                link = f"https://www.google.com/maps/search/?api=1&query={event['query']}"
                st.link_button(f"📍 {event['title']} 위치 보기", link)

    st.divider()
    
    # 일정 추가 기능
    with st.expander("➕ 이 날짜에 일정 추가하기"):
        with st.form(f"add_event_{selected_day}"):
            new_time = st.time_input("시간", value=datetime.strptime("14:00", "%H:%M"))
            new_title = st.text_input("장소/할일 이름")
            new_desc = st.text_input("설명")
            new_icon = st.selectbox("아이콘", ["🍜", "☕", "🛍️", "📸", "🚕", "🏨", "🚽"])
            submitted = st.form_submit_button("추가")
            
            if submitted:
                new_event = {
                    "time": new_time.strftime("%H:%M"),
                    "title": new_title,
                    "desc": new_desc,
                    "icon": new_icon,
                    "query": new_title
                }
                st.session_state.data["itinerary"][selected_day].append(new_event)
                # 시간순 정렬
                st.session_state.data["itinerary"][selected_day].sort(key=lambda x: x["time"])
                save_data(st.session_state.data)
                st.rerun()

# --------------------------------------------------------------------------------
# 탭 4: 저장됨 (맛집/장소)
# --------------------------------------------------------------------------------
with tabs[3]:
    st.markdown("### ❤️ 내 지도 즐겨찾기")
    
    places = st.session_state.data["saved_places"]
    
    for place in places:
        col1, col2 = st.columns([0.7, 0.3])
        with col1:
            st.markdown(f"**{place['name']}**")
            st.caption(place['desc'])
        with col2:
            st.link_button("지도 보기", place['link'])
        st.markdown("---")

    # 장소 추가 기능
    with st.expander("➕ 새 장소 저장하기"):
        with st.form("add_place"):
            p_name = st.text_input("장소 이름")
            p_desc = st.text_input("설명 (예: 오코노미야키 맛집)")
            p_submitted = st.form_submit_button("저장")
            
            if p_submitted:
                new_place = {
                    "name": p_name,
                    "desc": p_desc,
                    "link": f"https://www.google.com/maps/search/?api=1&query={p_name}"
                }
                st.session_state.data["saved_places"].insert(0, new_place)
                save_data(st.session_state.data)
                st.rerun()

# --- 데이터 초기화 버튼 (사이드바) ---
with st.sidebar:
    st.markdown("### 설정")
    if st.button("🗑️ 모든 데이터 초기화"):
        if os.path.exists(DATA_FILE):
            os.remove(DATA_FILE)
        st.session_state.data = DEFAULT_DATA
        st.rerun()
    
    st.info("입력하신 데이터는 'osaka_data.json' 파일에 자동 저장됩니다.")
