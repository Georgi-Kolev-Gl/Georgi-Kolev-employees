(function () {
  document.querySelector("#read").addEventListener("click", () => {
    const file = document.querySelector("#file").files[0];
    const reader = new FileReader();

    reader.addEventListener("load", (e) => {
      const text = e.target.result;
      const allData = [];
      const today = new Date();
      const allProjectsWithAtLeastTwoEmployees = [];

      function splitString(text, result) {
        text
          .toString()
          .split("\n")
          .forEach((line) => {
            const [empId, projId, startTime, endTime] = line.split(", ");

            result.push({ empId, projId, startTime, endTime });
          });
        return result;
      }
      splitString(text, allData);

      function getAllProjects(arrayOfAllProject) {
        const allProjects = arrayOfAllProject.reduce((acc, row) => {
          const existingProject = acc.find(
            (project) => project.projId === row.projId
          );

          if (existingProject) {
            existingProject.workTime.push({
              empId: row.empId,
              startTime: row.startTime,
              endTime: row.endTime,
            });
          } else {
            acc.push({
              projId: row.projId,
              workTime: [
                {
                  empId: row.empId,
                  startTime: row.startTime,
                  endTime: row.endTime,
                },
              ],
              teamwork: [],
            });
          }

          return acc;
        }, []);
        return allProjects;
      }

      const allProjects = getAllProjects(allData);

      allProjects.forEach((proj) => {
        if (proj.workTime.length > 1) {
          allProjectsWithAtLeastTwoEmployees.push(proj);
        }
      });
    
      function getAllProjectsWithMinTwoEmployees(obj) {
        obj.forEach((project) => {
          for (let i = 0; i < project.workTime.length - 1; i++) {
            for (let j = i + 1; j < project.workTime.length; j++) {
              let dayOfWork = 0;
              let endDateFirst = new Date();
              let endDateSecond = new Date();
              const [
                startTimeYearFirst,
                startTimeMonthFirst,
                startTimeDayFirst,
              ] = project.workTime[i].startTime.split("-");
              const startDateFirst = new Date(
                startTimeYearFirst,
                startTimeMonthFirst,
                startTimeDayFirst
              );
              if (project.workTime[i].endTime !== "NULL") {
                const [
                  endTimeYearFirst,
                  endTimeMonthFirst,
                  endTimeDayFirst,
                ] = project.workTime[i].endTime.split("-");
                endDateFirst = new Date(
                  endTimeYearFirst,
                  endTimeMonthFirst,
                  endTimeDayFirst
                );
              }
              const [
                startTimeYearSecond,
                startTimeMonthSecond,
                startTimeDaySecond,
              ] = project.workTime[j].startTime.split("-");
              const startDateSecond = new Date(
                startTimeYearSecond,
                startTimeMonthSecond,
                startTimeDaySecond
              );
              if (project.workTime[j].endTime !== "NULL") {
                const [
                  endTimeYearSecond,
                  endTimeMonthSecond,
                  endTimeDaySecond,
                ] = project.workTime[j].endTime.split("-");
                endDateSecond = new Date(
                  endTimeYearSecond,
                  endTimeMonthSecond,
                  endTimeDaySecond
                );
              }
              let startTime;
              let stopTime;
              if (
                startDateSecond > startDateFirst ||
                (Math.round(startDateFirst - startDateSecond) === 0 &&
                  startDateSecond < endDateFirst)
              ) {
                startTime = startDateSecond;
                if (endDateSecond < endDateFirst) {
                  stopTime = endDateSecond;
                } else {
                  stopTime = endDateFirst;
                }
              }
              if (
                startDateFirst > startDateSecond ||
                (Math.round(startDateFirst - startDateSecond) === 0 &&
                  startDateFirst < endDateSecond)
              ) {
                startTime = startDateFirst;
                if (endDateFirst < endDateSecond) {
                  stopTime = endDateFirst;
                } else {
                  stopTime = endDateSecond;
                }
              }
              if (startTime) {
                dayOfWork = Math.round((stopTime - startTime) / 86400000);
              }
              project.teamwork.push({
                empIdFirst: Number(project.workTime[i].empId),
                empIdSecond: Number(project.workTime[j].empId),
                dayOfTeamwork: dayOfWork,
                projectId: project.projId,
              });
            }
          }
        });

        return obj;
      }

      getAllProjectsWithMinTwoEmployees(allProjectsWithAtLeastTwoEmployees);

      function getAllCouplesWorkedOnCommonProject(obj) {
        let couplesWorkedOnCommonProject = [];
        obj.forEach((project) => {
          project.teamwork.forEach((el) => {
            couplesWorkedOnCommonProject.push(el);
          });
        });
        return couplesWorkedOnCommonProject;
      }
      let allCouplesWorkedOnCommonProject = getAllCouplesWorkedOnCommonProject(
        allProjectsWithAtLeastTwoEmployees
      );

      function findMaxDayOfWork(obj) {
        let result = {};
        let maxDayOfWork = -Infinity;
        obj.forEach((el, index) => {
          let isThereSameWorkingCopple = false;  
          let sumOfWorkDay = 0;
          for (let i = index + 1; i < obj.length; i++) {
            if (
              (el.empIdFirst === obj[i].empIdFirst ||
                el.empIdFirst === obj[i].empIdSecond) &&
              (el.empIdSecond === obj[i].empIdSecond ||
                el.empIdSecond === obj[i].empIdFirst)
            ) {
              isThereSameWorkingCopple = true;  
              sumOfWorkDay += el.dayOfTeamwork + obj[i].dayOfTeamwork;
            }
          }
          if (!isThereSameWorkingCopple) {
            sumOfWorkDay = el.dayOfTeamwork
          }
          if (maxDayOfWork < sumOfWorkDay) {
            maxDayOfWork = sumOfWorkDay;
            result.empIdFirst = el.empIdFirst;
            result.empIdSecond = el.empIdSecond;
            result.maxDayOfTeamWork = maxDayOfWork;
          }
        });
        return result;
      }

      let employeesWithMostWorkingDays = findMaxDayOfWork(
        allCouplesWorkedOnCommonProject
      );

      let coupleWithMOstWorkingDays = [];
      allCouplesWorkedOnCommonProject.forEach((el) => {
        if (
          (employeesWithMostWorkingDays.empIdFirst === el.empIdFirst ||
            employeesWithMostWorkingDays.empIdFirst === el.empIdSecond) &&
          (employeesWithMostWorkingDays.empIdSecond === el.empIdFirst ||
            employeesWithMostWorkingDays.empIdSecond === el.empIdSecond)
        ) {
            coupleWithMOstWorkingDays.push(el);
        }
      });

      function creatElement(element, text) {
        let newElement = document.createElement(element);
        if (text) {
          newElement.innerHTML = text;
        }
        return newElement;
      }

      function printrResult(arrayOfEmployees, containerToPrint) {
        containerToPrint.innerHTML = "";
        if (arrayOfEmployees.length === 0) {
          return;
        }
        let newTable = document.createElement("table");
        let tr = creatElement("tr");
        let th_1 = creatElement("th", "Employee ID #1");
        let th_2 = creatElement("th", "Employee ID #2");
        let th_3 = creatElement("th", "Project ID");
        let th_4 = creatElement("th", "Days worked");
        tr.append(th_1, th_2, th_3, th_4);
        newTable.append(tr);

        arrayOfEmployees.forEach((el) => {
          let tr = creatElement("tr");
          let td_1 = creatElement("td", el.empIdFirst);
          let td_2 = creatElement("td", el.empIdSecond);
          let td_3 = creatElement("td", el.projectId);
          let td_4 = creatElement("td", el.dayOfTeamwork);
          tr.append(td_1, td_2, td_3, td_4);
          newTable.append(tr);
        });
        containerToPrint.append(newTable);
      }
      const container = document.getElementById("container");
      printrResult(coupleWithMOstWorkingDays, container);
    });

    reader.readAsText(file);
  });
})();
