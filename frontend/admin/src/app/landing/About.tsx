export default function About() {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">About UGS Healthcare</h2>
        <p className="text-lg text-gray-700 mb-8">
          UGS is a healthcare technology company building secure, scalable, and
          user-friendly software to unify healthcare delivery.
        </p>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div>
            <h3 className="text-xl font-semibold text-blue-600">Mission</h3>
            <p className="text-gray-600">
              To simplify and digitize healthcare workflows for better access
              and service.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-blue-600">Vision</h3>
            <p className="text-gray-600">
              A seamlessly connected healthcare ecosystem for safer, smarter
              care.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-blue-600">Values</h3>
            <p className="text-gray-600">
              Trust, Innovation, Accessibility, and Partnership guide our work.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
