import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import styles from "./calendar.module.css";

function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(dayjs()); // 현재 월을 상태로 관리합니다.
  const [selectedDate, setSelectedDate] = useState(dayjs()); // 선택된 날짜를 상태로 관리합니다.
  const [holidays, setHolidays] = useState([]);
  const [schedule, setSchedule] = useState({}); // 스케줄 정보를 상태로 관리합니다.

  // API에서 공휴일 정보를 가져오는 함수
  const fetchHolidays = async () => {
    try {
      const serviceKey =
        "7%2BAaSmpK5tpk%2BDTGrlslJBQz8ri55TufnrLlR%2B0fExcf%2FQGHqmN4H9USkFDVdlLtxfHu90IcOMbbBBY4e0eljg%3D%3D";
      const url = `http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getAnniversaryInfo`;
      const queryParams = new URLSearchParams({
        ServiceKey: serviceKey,
        pageNo: 1,
        numOfRows: 10,
        solYear: currentMonth.year(),
        solMonth: currentMonth.month() + 1,
      });

      const response = await fetch(`${url}?${queryParams.toString()}`);
      const data = await response.text(); // XML 형식의 응답을 문자열로 받음
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml"); // 문자열을 XML 문서로 파싱
      const items = xmlDoc.getElementsByTagName("item");
      const holidayList = Array.from(items).map((item) => {
        return item.getElementsByTagName("locdate")[0].textContent; // 각 item의 locdate 값을 배열에 추가
      });
      setHolidays(holidayList);
    } catch (error) {
      console.error("Error fetching holidays:", error);
    }
  };

  // 선택된 날짜의 스케줄을 추가하는 함수
  const addSchedule = (date, scheduleName) => {
    // 선택된 날짜의 스케줄을 설정합니다.
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      [date.format("YYYY-MM-DD")]: scheduleName,
    }));
  };

  // 선택된 날짜의 스케줄을 삭제하는 함수
  const deleteSchedule = (date) => {
    // 선택된 날짜의 스케줄을 제거합니다.
    const updatedSchedule = { ...schedule };
    delete updatedSchedule[date.format("YYYY-MM-DD")];
    setSchedule(updatedSchedule);
  };

  // 이전 달로 이동하는 함수
  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => prevMonth.subtract(1, "month"));
  };

  // 다음 달로 이동하는 함수
  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => prevMonth.add(1, "month"));
  };

  // 오늘 날짜로 이동하는 함수
  const goToToday = () => {
    setCurrentMonth(dayjs());
  };

  // 선택된 날짜가 오늘인지 확인하는 함수
  const isToday = (date) => {
    return date.isSame(dayjs(), "day");
  };

  // 선택된 날짜가 공휴일인지 확인하는 함수
  const isHoliday = (date) => {
    console.log(holidays);
    return holidays.includes(date.format("YYYYMMDD"));
  };

  // 캘린더를 렌더링하는 함수
  const renderCalendar = () => {
    const weeks = [];
    let currentDay = currentMonth.startOf("month").startOf("week");

    while (currentDay.isBefore(currentMonth.endOf("month").endOf("week"))) {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const isTargetDay = currentDay.isSame(selectedDate, "day");
        const isOtherMonth = currentDay.month() !== currentMonth.month();
        days.push(
          <span
            key={currentDay.format("YYYY-MM-DD")}
            className={`flex w-full items-center justify-center h-11 ${
              styles.day
            } ${isTargetDay ? styles["target-date"] : ""} ${
              isOtherMonth ? styles["other-month"] : ""
            }`}
            onClick={() => setSelectedDate(currentDay)}
          >
            {isHoliday(currentDay) && (
              <span className={styles.holiday}>공휴일</span>
            )}
            {
              <span>
                <span
                  className={`${
                    isToday(currentDay) ? "text-white" : null
                  } relative p-1 size-6 inline-flex justify-center items-center`}
                >
                  {isToday(currentDay) && (
                    <span className="bg-red-300 rounded-full absolute size-6 -z-10 left-0 top-0"></span>
                  )}
                  {currentDay.format("D")}
                </span>
                일
              </span>
            }
          </span>
        );
        currentDay = currentDay.add(1, "day");
      }
      weeks.push(
        <div key={currentDay.format("YYYY-MM-DD")} className={styles.week}>
          {days}
        </div>
      );
    }
    return weeks;
  };

  useEffect(() => {
    fetchHolidays(); // 컴포넌트가 마운트될 때 한 번만 공휴일 정보를 가져옵니다.
  }, [currentMonth]); // currentMonth 상태가 변경될 때마다 공휴일 정보를 다시 가져옵니다.

  return (
    <div>
      <div className="mb-8 text-xl text-center flex justify-between">
        <div>{currentMonth.format("YYYY년 M월")}</div>
        <div className="flex gap-2">
          <button
            className="rounded-sm shadow px-2"
            onClick={goToPreviousMonth}
          >
            {"<"}
          </button>
          <button className="rounded-sm shadow px-2" onClick={goToToday}>
            오늘
          </button>
          <button className="rounded-sm shadow px-2" onClick={goToNextMonth}>
            {">"}
          </button>
        </div>
      </div>
      <div className={styles.days}>
        <span className="text-red-500">일</span>
        <span>월</span>
        <span>화</span>
        <span>수</span>
        <span>목</span>
        <span>금</span>
        <span className="text-red-500">토</span>
      </div>
      <div className={`${styles.calendar} relative z-10`}>
        {renderCalendar()}
      </div>
      <div>
        {/* 스케줄 추가 및 삭제 UI를 구현할 수 있는 부분입니다. */}
        {/* <input
          type="text"
          placeholder="스케줄 이름"
          value={schedule[selectedDate.format("YYYY-MM-DD")] || ""}
          onChange={(e) => addSchedule(selectedDate, e.target.value)}
        />
        <button onClick={() => deleteSchedule(selectedDate)}>삭제</button> */}
      </div>
    </div>
  );
}

export default Calendar;
