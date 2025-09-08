"use client";

const features = [
  {
    title: "Digital Prescriptions (eRx)",
    desc: "Doctors can create, sign, and share secure prescriptions instantly.",
  },
  {
    title: "Appointment Management",
    desc: "Seamlessly handle in-person and online consultations.",
  },
  {
    title: "Pharmacy Integration",
    desc: "Patients can order medicines directly with real-time updates.",
  },
  {
    title: "Analytics & Insights",
    desc: "Hospitals and pharma companies can access dashboards and reports.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-12">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 bg-gray-100 rounded-xl shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
