import React from "react";
import dayjs from "dayjs";
import styles from "./calendar.module.css"; // 스타일 파일을 불러옵니다.

function Calendar() {
  // 캘린더를 렌더링하는 함수입니다.
  const renderCalendar = () => {
    // 웨딩 날짜를 기준으로 dayjs 객체를 생성합니다.
    const targetDate = dayjs();
    // 해당 달의 첫 번째 날을 구하고, 해당 주의 첫 번째 날로 설정합니다.
    const firstDayOfMonth = targetDate.startOf("month").startOf("week");
    // 해당 달의 마지막 날을 구하고, 해당 주의 마지막 날로 설정합니다.
    const lastDayOfMonth = targetDate.endOf("month").endOf("week");

    const weeks = []; // 캘린더 주를 저장할 배열입니다.

    let currentDay = firstDayOfMonth; // 현재 날짜를 해당 달의 첫 번째 날로 설정합니다.
    // 마지막 주까지 반복합니다.
    while (currentDay.isBefore(lastDayOfMonth)) {
      const days = []; // 한 주의 날짜를 저장할 배열입니다.
      // 한 주의 일수(7일)만큼 반복합니다.
      for (let i = 0; i < 7; i++) {
        const isTargetday = currentDay.isSame(targetDate, "day"); // 해당 날짜인지 확인합니다.
        const isSunday = currentDay.day() === 0; // 일요일인지 확인합니다.
        const isSaturday = currentDay.day() === 6; // 토요일인지 확인합니다.
        const isOtherMonth = currentDay.month() !== targetDate.month(); // 다른 달인지 확인합니다.
        // 각 날짜를 span 태그로 표현하고, 휴일인 경우에는 스타일을 추가합니다.
        days.push(
          <span
            key={currentDay.format("YYYY-MM-DD")} // 고유한 키를 설정합니다.
            className={`${styles.day} ${
              isTargetday ? styles["target-date"] : ""
            } ${
              isSunday ? styles.holiday : "" // 휴일인 경우 스타일을 추가합니다.
            } ${isOtherMonth ? styles["other-month"] : ""}`}
          >
            {/* {isTargetday ? <span className={styles.heart}></span> : ""} */}
            {currentDay.format("D")}
            {isTargetday && (
              <span
                className="absolute w-12 -z-10"
                style={{
                  background: "#ff9c9c",
                  position: "absolute",
                  zIndex: "-1",
                }}
              />
            )}
          </span>
        );
        currentDay = currentDay.add(1, "day"); // 다음 날짜로 이동합니다.
      }
      // 한 주의 날짜를 div 태그로 묶어서 주차에 추가합니다.
      weeks.push(
        <div key={currentDay.format("YYYY-MM-DD")} className={styles.week}>
          {days}
        </div>
      );
    }

    return weeks; // 캘린더 주를 반환합니다.
  };

  // 요일 구하기
  const getDay = (day) => {
    // 현재 날짜를 가져옵니다.
    const currentDate = dayjs(day);

    // 현재 날짜의 요일을 가져옵니다. (0: 일요일, 1: 월요일, ..., 6: 토요일)
    const dayOfWeek = currentDate.day();

    // 각 요일에 대한 한글 표시를 정의합니다.
    const dayOfWeekKorean = ["일", "월", "화", "수", "목", "금", "토"];

    // 현재 요일에 해당하는 한글 요일을 반환합니다.
    return dayOfWeekKorean[dayOfWeek];
  };

  return (
    <div>
      <div className="mb-8 text-xl text-center">
        {/* {dayjs(meta.weddingDate)
          .locale("ko")
          .format("YYYY년 MM월 DD일 dddd A h시")} */}
        {dayjs().locale("ko").format("M월")}
      </div>
      {/* 요일을 나타내는 부분입니다. */}
      <div className={styles.days}>
        <span className="text-red-500">일</span>
        <span>월</span>
        <span>화</span>
        <span>수</span>
        <span>목</span>
        <span>금</span>
        <span>토</span>
      </div>
      {/* 캘린더를 나타내는 부분입니다. */}
      <div className={`${styles.calendar} relative z-10`}>
        {renderCalendar()}
      </div>
    </div>
  );
}

export default Calendar;
