import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import styles from "./calendar.module.css";

function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(dayjs()); // 현재 월을 상태로 관리합니다.
  const [isEditModal, setIsEditModal] = useState(false); // 선택된 날짜를 상태로 관리합니다.
  const [selectedDate, setSelectedDate] = useState(null); // 선택된 날짜를 상태로 관리합니다.
  const [holidays, setHolidays] = useState([]);
  const [schedule, setSchedule] = useState({}); // 스케줄 정보를 상태로 관리합니다.

  // API에서 공휴일 정보를 가져오는 함수
  const fetchHolidays = async () => {
    try {
      const serviceKey =
        "WiqpH7lJvnqak4Tyw0vYtSCKBz+eigipH//wVq3Zhl20Q+umW9MLXyGMG7LAaYTItiLHFJ90m1Z3lxZFZiNskQ==";
      const url = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo`;
      const queryParams = new URLSearchParams({
        serviceKey: serviceKey,
        // pageNo: 1,
        // numOfRows: 10,
        solYear: currentMonth.year(),
        solMonth: (currentMonth.month() + 1).toString().padStart(2, "0"),
      });

      const response = await fetch(`${url}?${queryParams.toString()}`);
      const data = await response.text(); // XML 형식의 응답을 문자열로 받음
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml"); // 문자열을 XML 문서로 파싱
      const items = xmlDoc.getElementsByTagName("item");
      const holidayList = Array.from(items).map((item) => {
        return {
          dateKind: item.getElementsByTagName("dateKind")[0].textContent,
          locdate: item.getElementsByTagName("locdate")[0].textContent,
          isHoliday: item.getElementsByTagName("isHoliday")[0].textContent,
          dateName: item.getElementsByTagName("dateName")[0].textContent,
          seq: item.getElementsByTagName("seq")[0].textContent,
        }; // 각 item의 locdate 값을 배열에 추가
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
    return holidays.includes(date.format("YYYYMMDD"));
  };

  // 캘린더를 렌더링하는 함수
  const renderCalendar = () => {
    const weeks = [];
    let currentDay = currentMonth.startOf("month").startOf("week");

    while (currentDay.isBefore(currentMonth.endOf("month").endOf("week"))) {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const tempDay = currentDay;
        const isTargetDay = currentDay.isSame(dayjs(), "day"); // 대상 날짜
        const isOtherMonth = currentDay.month() !== currentMonth.month(); // 해당월이 아닌 날짜
        const isSunday = currentDay.day() === 0; // 일요일인지 확인합니다.
        const isSaturday = currentDay.day() === 6; // 토요일인지 확인합니다.
        days.push(
          <div
            key={currentDay.format("YYYY-MM-DD")}
            className={`flex flex-col justify-start w-full  items-end min-h-20 aspect-square p-1 gap-0.5 overflow-y-auto ${
              styles.day
            } ${isTargetDay ? styles["target-date"] : ""} ${
              isOtherMonth ? styles["other-month"] : ""
            } ${isSunday || isSaturday ? "bg-stone-100 text-stone-400" : ""}`}
            onClick={() => {
              onHandleEditModal();
              setSelectedDate(tempDay);
            }}
          >
            {
              <span>
                <span
                  className={`${
                    isToday(currentDay) ? "text-white" : null
                  } relative p-1 size-6 inline-flex justify-center items-center`}
                >
                  {isToday(currentDay) && (
                    <span className="bg-red-500 rounded-full absolute size-6 -z-10 left-0 top-0"></span>
                  )}
                  {currentDay.format("D")}
                </span>
                일
              </span>
            }
            {/* 개인 일정 */}
            {schedule[currentDay?.format("YYYY-MM-DD")] ? (
              <span
                className={"bg-blue-400 text-white px-2 rounded w-full text-xs"}
              >
                • {schedule[currentDay?.format("YYYY-MM-DD")]}
              </span>
            ) : null}
            {/* 공휴일 */}
            <span className={"bg-red-200 px-2 rounded w-full text-xs"}>
              {
                holidays.find(
                  (el) =>
                    el.locdate === currentDay?.format("YYYYMMDD") &&
                    el.isHoliday === "Y"
                )?.dateName
              }
            </span>
          </div>
        );
        currentDay = currentDay.add(1, "day");
      }
      weeks.push(
        <div
          key={currentDay.format("YYYY-MM-DD")}
          className="grid grid-cols-7 border-b border-x divide-x first:border-t"
        >
          {days}
        </div>
      );
    }
    return weeks;
  };

  // 일정 수정 모달 핸들러
  const onHandleEditModal = () => {
    setIsEditModal((prev) => !prev);
  };

  useEffect(() => {
    fetchHolidays(); // 컴포넌트가 마운트될 때 한 번만 공휴일 정보를 가져옵니다.
  }, [currentMonth]); // currentMonth 상태가 변경될 때마다 공휴일 정보를 다시 가져옵니다.

  return (
    <div>
      <div className="mb-2 text-xl text-center flex justify-between items-center">
        <h2 className="text-3xl font-bold">
          {currentMonth.format("YYYY년 M월")}
        </h2>
        <div className="flex text-xs">
          <button
            className="hover:bg-stone-200 transition rounded shadow px-2"
            onClick={goToPreviousMonth}
          >
            {"<"}
          </button>
          <button
            className="hover:bg-stone-200 transition rounded shadow px-4"
            onClick={goToToday}
          >
            오늘
          </button>
          <button
            className="hover:bg-stone-200 transition rounded shadow px-2"
            onClick={goToNextMonth}
          >
            {">"}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 justify-items-end">
        <span className="p-1 text-stone-400">일</span>
        <span className="p-1 ">월</span>
        <span className="p-1 ">화</span>
        <span className="p-1 ">수</span>
        <span className="p-1 ">목</span>
        <span className="p-1 ">금</span>
        <span className="p-1 text-stone-400">토</span>
      </div>
      <div className={`${styles.calendar} relative z-10`}>
        {renderCalendar()}
      </div>
      {isEditModal ? (
        <Modal onClose={onHandleEditModal}>
          <form className="flex flex-col" onSubmit={onHandleEditModal}>
            <h3 className="text-lg mb-2 font-semibold">일정 등록 및 수정</h3>
            {/* 스케줄 추가 및 삭제 UI를 구현할 수 있는 부분입니다. */}
            <input
              className="border-b-2 transition focus:border-orange-200 outline-none w-full  mb-4"
              type="text"
              placeholder="스케줄 이름"
              value={schedule[selectedDate?.format("YYYY-MM-DD")] || ""}
              onChange={(e) => addSchedule(selectedDate, e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                className="rounded-sm shadow px-2 hover:bg-stone-200 transition"
                onClick={onHandleEditModal}
              >
                입력
              </button>
              <button
                className="rounded-sm shadow px-2 hover:bg-stone-200 transition"
                onClick={() => deleteSchedule(selectedDate)}
              >
                삭제
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="p-6 bg-white rounded-lg shadow-xl w-96"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
export default Calendar;
