import React, { useState } from "react";
import { assets } from "../../assets.admin/assets_admin/assetsadmin";
import { toast } from "react-toastify";

const AddDoctor = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    experience: "1 year",
    fees: "",
    speciality: "General physician",
    degree: "",
    address1: "",
    address2: "",
    about: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const uploadImageToCloudinary = async () => {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "your_preset"); // <-- замени
    data.append("cloud_name", "djmrfjkki"); // <-- замени

    const res = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", {
      method: "POST",
      body: data,
    });
    const json = await res.json();
    return json.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.fees ||
      !form.degree ||
      !form.address1 ||
      !form.address2 ||
      !form.about ||
      !image
    ) {
      setError("Пожалуйста, заполните все поля и загрузите изображение.");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("experience", form.experience);
    formData.append("fees", form.fees);
    formData.append("speciality", form.speciality);
    formData.append("degree", form.degree);
    formData.append("address", JSON.stringify({
      line1: form.address1,
      line2: form.address2
    }));
    formData.append("about", form.about);
    formData.append("image", image); // файл

    try {
      const res = await fetch("http://localhost:8000/admin/add_doctor", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Ошибка при добавлении");

      toast("Доктор успешно добавлен")

      setForm({
        name: "", email: "", password: "", experience: "1 year", fees: "",
        speciality: "General physician", degree: "", address1: "", address2: "", about: ""
      });
      setImage(null);
      setPreview(null);
      setError("");
    } catch (err) {
      setError(err.message || "Произошла ошибка");
    }
  };

  return (
    <form className="m-5 w-full" onSubmit={handleSubmit}>
      <p className="mb-3 text-lg font-medium">Add Doctor</p>

      <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80-vh] overflow-scroll">
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img">
            <img
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
              src={preview || assets.upload_area}
              alt=""
            />
          </label>
          <input type="file" id="doc-img" hidden onChange={handleImageChange} />
          <p>
            Загрузить картинку <br /> доктора
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Имя доктора</p>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Имя"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Почта доктора</p>
              <input
                className="border rounded px-3 py-2"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Почта"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Пароль доктора</p>
              <input
                className="border rounded px-3 py-2"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Пароль"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Опыт</p>
              <select
                className="border rounded px-3 py-2"
                name="Опыт"
                value={form.experience}
                onChange={handleChange}
              >
                <option value="1 year">1 год</option>
                <option value="2 year">2 года</option>
                <option value="3 year">3 года</option>
                <option value="4 year">4 года</option>
                <option value="5 year">5 лет</option>
                <option value="6 year">6 лет</option>
                <option value="7 year">7 лет</option>
                <option value="8 year">8 лет</option>
                <option value="10 year">10 лет</option>
                <option value="1 year">11 лет</option>
                <option value="2 year">12 лет</option>
                <option value="3 year">13 лет</option>
                <option value="4 year">14 лет</option>
                <option value="5 year">15 лет</option>
                <option value="6 year">16 лет</option>
                <option value="7 year">17 лет</option>
                <option value="8 year">18 лет</option>
                <option value="10 year">20 лет</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Стоимость</p>
              <input
                className="border rounded px-3 py-2"
                type="number"
                name="fees"
                value={form.fees}
                onChange={handleChange}
                placeholder="Стоимость"
                required
              />
            </div>
          </div>

          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Специальность</p>
              <select
                className="border rounded px-3 py-2"
                name="Специальность"
                value={form.speciality}
                onChange={handleChange}
              >
                <option value="General physician">Главный врач</option>
                <option value="Gynecologist">ГИнеколог</option>
                <option value="Dermatologist">Дерматолог</option>
                <option value="Pedeatrians">Педиатр</option>
                <option value="Neurologist">Невролог</option>
                <option value="Gastroenterologist">Гастроэнтеролог</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Квалификация</p>
              <input
                className="border rounded px-3 py-2"
                type="text"
                name="degree"
                value={form.degree}
                onChange={handleChange}
                placeholder="Квалификация"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Адрес</p>
              <input
                className="border rounded px-3 py-2"
                type="text"
                name="address1"
                value={form.address1}
                onChange={handleChange}
                placeholder="Адрес 1"
                required
              />
              <input
                className="border rounded px-3 py-2"
                type="text"
                name="address2"
                value={form.address2}
                onChange={handleChange}
                placeholder="Адрес 2"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <p className="mt-4 mb-2">Подробнее</p>
          <textarea
            className="w-full px-4 pt-2 border rounded"
            name="about"
            value={form.about}
            onChange={handleChange}
            placeholder="Напишите подробнее про доктора"
            rows={5}
            required
          />
        </div>

        <button type="submit" className="bg-primary px-10 py-3 mt-4 text-white rounded-full">
          Добавить доктора
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;
