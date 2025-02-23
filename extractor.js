import { Builder, By, Select } from "selenium-webdriver";
import input from "./input.json" with { type: "json" };

import fs from "node:fs";

const driver = await new Builder().forBrowser("chrome").build();
try {
  await driver.manage().setTimeouts({ implicit: 10000 });

  await driver.get(
    "https://app.uff.br/auth/realms/master/protocol/openid-connect/auth?client_id=quadro-de-horarios&nonce=fmBPljQHRKZ9R45sXB1jpWcEyJQtU%2FhL8SI9rDIlK62k6c8hDFsR8A6%2B5w0qTY0oknp7GDGKH2OYoxgLS6m48w%3D%3D&redirect_uri=%2Fgraduacao%2Fquadrodehorarios%2Fsessions%2Fnew&response_type=code&scope=openid+profile+email+User.Read&state=fmBPljQHRKZ9R45sXB1jpWcEyJQtU%2FhL8SI9rDIlK62k6c8hDFsR8A6%2B5w0qTY0oknp7GDGKH2OYoxgLS6m48w%3D%3D"
  );

  const usernameInput = await driver.findElement(By.css("#username"));
  const passwordInput = await driver.findElement(By.css("#password"));
  const loginBtn = await driver.findElement(By.css("#kc-login"));

  await usernameInput.sendKeys(input.login);
  await passwordInput.sendKeys(input.password);

  await loginBtn.click();

  const courseSelect = new Select(
    await driver.findElement(By.css("#q_vagas_turma_curso_idcurso_eq"))
  );

  await courseSelect.selectByVisibleText(input.course);

  console.log("searching classrooms");
  const searchBtn = await driver.findElement(By.css("#run_search"));
  await searchBtn.click();

  let allClassrooms = [];

  while (true) {
    const classrooms = await extractClassrooms(driver);
    allClassrooms = allClassrooms.concat(classrooms);
    try {
      const next = await driver.findElement(By.css("a[rel='next']"));
      await next.click();
    } catch (e) {
      break;
    }
  }

  console.log("writing classrooms to file");
  fs.writeFileSync(
    "classrooms.json",
    JSON.stringify({ classrooms: allClassrooms })
  );
} finally {
  await driver.quit();
}

async function extractClassrooms(driver) {
  console.log("getting classroom data");
  const classroomRows = await driver.findElements(
    By.css("tr[data-anosemestre]")
  );

  const classrooms = await Promise.all(
    Array.from(classroomRows).map(async (node) => {
      const classroom = {};
      classroom.code = await (
        await node.findElement(By.css("td:first-child a"))
      ).getText();
      classroom.name = await (
        await node.findElement(By.css("td.disciplina-nome a"))
      ).getText();
      const teacher = await (
        await node.findElement(By.css("td.disciplina-nome"))
      ).getAttribute("data-original-title");

      classroom.teacher = teacher
        .split("\n")[0]
        .replace("Professor(es): ", "")
        .replace("<br/><br/>", "");

      const extractTime = async (day) => {
        classroom[day] = await (
          await node.findElement(By.css(`td.horario-${day}`))
        ).getText();
      };
      await Promise.all([
        extractTime("segunda"),
        extractTime("terca"),
        extractTime("quarta"),
        extractTime("quinta"),
        extractTime("sexta"),
      ]);
      console.log(classroom);

      return classroom;
    })
  );
  return classrooms;
}
